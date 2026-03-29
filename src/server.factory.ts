import { VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import type { Request, Response } from 'express'
import { json } from 'express'

import type { ServerOptions } from '@/server.types.js'

import { createOpenApiDocument } from '@/openapi/index.js'
import { ZodValidationTransform } from '@/transforms/index.js'

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
 * Server.create(AppModule, {
 *   port: 3200,
 *   title: 'My API',
 *   description: 'My API description',
 * })
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
	 * @param options - Server configuration.
	 * @returns The NestJS application instance.
	 */
	async create(module: Module, options: ServerOptions) {
		const {
			port,
			title,
			description,
			version = '1.0',
			globalPrefix = 'api',
			healthMessage = `${title} is running`,
			docs,
		} = options

		const app = await NestFactory.create(module)

		app.setGlobalPrefix(globalPrefix)
		app.enableVersioning({
			type: VersioningType.URI,
		})
		app.useGlobalPipes(new ZodValidationTransform())

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
			.build()

		const document = createOpenApiDocument(
			SwaggerModule.createDocument(app, config),
		)

		SwaggerModule.setup(globalPrefix, app, document)

		const http = app.getHttpAdapter().getInstance()

		http.use('/health', (_: Request, res: Response) => {
			res.status(200).send(healthMessage)
		})

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
					pageTitle: options.title,
					showDeveloperTools: 'never',
					theme: docs.theme ?? 'moon',
					title: options.title,
					url: `/${globalPrefix}-json`,
				}),
			)
		}

		await app.listen(port)

		return app
	},
}
