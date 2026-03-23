import { VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import type { Request, Response } from 'express'
import { json } from 'express'

import { createOpenApiDocument } from '@/openapi'
import type { ServerOptions } from '@/server.types'
import { ZodValidationTransform } from '@/transforms'

const DEFAULT_SCALAR_CSS = `
  .open-api-client-button { display: none !important; }
  .agent-button-container { display: none !important; }
  label[data-v-4f7e7d02] { display: none !important; }
  button[data-v-9cc2ab84].bg-sidebar-b-search { display: none !important; }
  a[href="https://www.scalar.com"] { display: none !important; }
  div[data-v-0b1e2255].badge { display: none !important; }
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
 * import { Server } from 'aw-backend/server'
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
			http.use(
				`/${globalPrefix}/reference`,
				apiReference({
					customCss: docs.customCss ?? DEFAULT_SCALAR_CSS,
					documentDownloadType: 'none',
					favicon: docs.favicon,
					pageTitle: docs.pageTitle,
					showDeveloperTools: 'never',
					theme: docs.theme ?? 'moon',
					title: docs.title,
					url: `/${globalPrefix}-json`,
				}),
			)
		}

		await app.listen(port)

		return app
	},
}
