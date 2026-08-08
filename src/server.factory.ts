import { Logger, VersioningType } from '@nestjs/common'
import { ModulesContainer, NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { ConfigService } from '@turystack/nestjs-config'
import type { Request, Response } from 'express'
import { json } from 'express'

// Nest/Swagger metadata keys — inlined because their home modules are not
// exported subpaths under nodenext resolution.
const API_EXTRA_MODELS_METADATA = 'swagger/apiExtraModels'
const PATH_METADATA = 'path'

import { createCorrelationMiddleware } from '@/correlation.middleware.js'
import type { ServerOptionsInput } from '@/server.types.js'

import {
	EXCEPTION_SCHEMA_NAME,
	registerExceptionComponentSchema,
} from '@/openapi/openapi.errors.js'
import {
	createOpenApiDocument,
	filterDocumentByPrefix,
} from '@/openapi/openapi.utils.js'
import { AppErrorTransform } from '@/transforms/app-error.transform.js'
import { ResponseBlacklistTransform } from '@/transforms/response-blacklist.transform.js'
import { ResponseFieldsTransform } from '@/transforms/response-fields.transform.js'
import { ZodValidationTransform } from '@/transforms/zod.transform.js'

const DEFAULT_SCALAR_CSS = `
	.open-api-client-button { display: none !important; }
  .agent-button-container { display: none !important; }
	.scalar-mcp-layer-link { display: none !important; }
	.scalar-card-checkbox { display: none !important; }
	.flex.gap-1.5 { display: none !important; }
  a[href="https://www.scalar.com"] { display: none !important; }
	button.bg-sidebar-b-search.text-sidebar-c-2 { display: none !important; }
	div:has(> .badge) { display: none !important; }
`

type Module = new (...args: unknown[]) => unknown

/**
 * HTTP server factory.
 *
 * Bootstraps a NestJS application with global prefix, URI versioning,
 * Zod validation, raw body capture, Swagger/OpenAPI docs, health check,
 * and an optional Scalar API reference UI.
 *
 * @example
 * ```ts
 * import { Server } from '@turystack/nestjs-server'
 * import { AppModule } from './app.module'
 *
 * Server.create(AppModule, (config) => ({
 *   port: config.get('PORT'),
 *   title: 'My API',
 *   description: 'My API description',
 * }))
 * ```
 */
export const Server = {
	/**
	 * Creates and starts the HTTP server.
	 *
	 * Endpoints configured automatically:
	 * - `GET /health` — health check
	 * - `GET /<prefix>/openapi` — OpenAPI JSON
	 * - `GET /<prefix>/reference` — API reference UI (when `docs` is provided)
	 *
	 * @param module - The root NestJS module.
	 * @param options - Server configuration or a typed config factory.
	 * @returns The NestJS application instance.
	 */
	async create(module: Module, options: ServerOptionsInput) {
		const app = await NestFactory.create(module)
		const resolvedOptions =
			typeof options === 'function' ? options(app.get(ConfigService)) : options
		const {
			port,
			title,
			description,
			version = '1.0',
			globalPrefix = 'api',
			healthMessage = `${title} is running`,
			docs,
			projects,
			interceptors = [],
		} = resolvedOptions

		app.getHttpAdapter().getInstance().set('trust proxy', 1)

		// Registered before anything else: everything downstream has to run
		// inside the scope, including the body parser and the global filters.
		const correlation = await createCorrelationMiddleware()

		if (correlation) {
			app.use(correlation)
		}

		app.enableCors()
		app.setGlobalPrefix(globalPrefix)
		app.enableVersioning({
			type: VersioningType.URI,
		})
		app.useGlobalPipes(new ZodValidationTransform())
		app.useGlobalInterceptors(
			...interceptors,
			new ResponseBlacklistTransform(),
			new ResponseFieldsTransform(),
		)
		app.useGlobalFilters(new AppErrorTransform())

		app.use(
			json({
				verify: (req: Request, _: Response, rawBody: Buffer) => {
					;(
						req as Request & {
							rawBody: Buffer
						}
					).rawBody = rawBody
				},
			}),
		)

		const config = new DocumentBuilder()
			.setTitle(title)
			.setDescription(description)
			.setVersion(version)
			.addBearerAuth({
				bearerFormat: 'JWT',
				scheme: 'bearer',
				type: 'http',
			})
			.build()

		registerExceptionComponentSchema()
		const document = createOpenApiDocument(
			withoutSwaggerDuplicateDtoLogs(() =>
				SwaggerModule.createDocument(app, config),
			),
		)

		SwaggerModule.setup(globalPrefix, app, document)

		const http = app.getHttpAdapter().getInstance()

		http.get('/health', (_: Request, res: Response) => {
			res.status(200).send({
				message: healthMessage,
				status: 'up',
			})
		})

		if (projects?.length) {
			const allPrefixes = projects
				.map((p) => p.prefix)
				.filter((p): p is string => !!p)

			const extraSchemasByPrefix = new Map<string, Set<string>>()
			const modulesContainer = app.get(ModulesContainer)

			for (const module of modulesContainer.values()) {
				for (const controller of module.controllers.values()) {
					const metatype = controller.metatype
					if (!metatype) {
						continue
					}

					const extraModels = Reflect.getMetadata(
						API_EXTRA_MODELS_METADATA,
						metatype,
					) as
						| Array<{
								name: string
						  }>
						| undefined

					if (!extraModels?.length) {
						continue
					}

					const pathMeta = Reflect.getMetadata(PATH_METADATA, metatype) as
						| string
						| string[]
						| undefined
					const pathStr = Array.isArray(pathMeta) ? pathMeta[0] : pathMeta
					if (!pathStr) {
						continue
					}

					const matchedPrefix =
						allPrefixes.find(
							(p) => pathStr === p || pathStr.startsWith(`${p}/`),
						) ?? ''

					if (!extraSchemasByPrefix.has(matchedPrefix)) {
						extraSchemasByPrefix.set(matchedPrefix, new Set())
					}
					const set = extraSchemasByPrefix.get(matchedPrefix)
					for (const model of extraModels) {
						set?.add(model.name)
					}
				}
			}

			for (const project of projects) {
				const projectExtras = [
					EXCEPTION_SCHEMA_NAME,
					...(extraSchemasByPrefix.get(project.prefix ?? '') ?? []),
				]
				const projectDoc = filterDocumentByPrefix(
					document,
					project,
					allPrefixes,
					projectExtras,
				)
				const basePath = project.prefix
					? `/${globalPrefix}/v1/${project.prefix}`
					: `/${globalPrefix}/v1`

				http.use(`${basePath}/openapi`, (_: Request, res: Response) => {
					res.status(200).send(projectDoc)
				})

				if (docs) {
					const customCss: string = [
						DEFAULT_SCALAR_CSS,
						docs.customCss,
					]
						.filter(Boolean)
						.join('\n')

					http.use(
						`${basePath}/reference`,
						apiReference({
							customCss,
							documentDownloadType: 'none',
							favicon: docs.favicon,
							pageTitle: project.title,
							showDeveloperTools: 'never',
							theme: project.theme ?? docs.theme ?? 'moon',
							title: project.title,
							url: `${basePath}/openapi`,
						}),
					)
				}
			}
		} else {
			http.use(`/${globalPrefix}/openapi`, (_: Request, res: Response) => {
				res.status(200).send(document)
			})

			if (docs) {
				const customCss: string = [
					DEFAULT_SCALAR_CSS,
					docs.customCss,
				]
					.filter(Boolean)
					.join('\n')

				http.use(
					`/${globalPrefix}/reference`,
					apiReference({
						customCss,
						documentDownloadType: 'none',
						favicon: docs.favicon,
						pageTitle: resolvedOptions.title,
						showDeveloperTools: 'never',
						theme: docs.theme ?? 'moon',
						title: resolvedOptions.title,
						url: `/${globalPrefix}-json`,
					}),
				)
			}
		}

		await app.listen(port)

		return app
	},
}

function withoutSwaggerDuplicateDtoLogs<T>(factory: () => T): T {
	const originalError = Logger.error

	Logger.error = ((message: unknown, ...optionalParams: unknown[]) => {
		if (
			typeof message === 'string' &&
			message.startsWith('Duplicate DTO detected:')
		) {
			return
		}

		originalError.call(Logger, message, ...optionalParams)
	}) as typeof Logger.error

	try {
		return factory()
	} finally {
		Logger.error = originalError
	}
}
