/** API project definition for per-prefix OpenAPI docs. */
export type ApiProject = {
	/** Project identifier. */
	name: string
	/** Title displayed in the Scalar reference UI. */
	title: string
	/** Route prefix (omit for the default/core project). */
	prefix?: string
	/** Theme. */
	theme?:
		| 'default'
		| 'alternate'
		| 'moon'
		| 'purple'
		| 'solarized'
		| 'bluePlanet'
		| 'deepSpace'
		| 'saturn'
		| 'kepler'
		| 'elysiajs'
		| 'fastify'
		| 'mars'
		| 'laserwave'
		| 'none'
}

/** Configuration for the API reference UI (Scalar). */
export type DocsReferenceOptions = {
	/** Reference UI provider. */
	provider: 'scalar'
	/** Custom CSS overrides for the reference UI. */
	customCss?: string
	/** Favicon URL. */
	favicon?: string
	/** Theme. */
	theme?:
		| 'default'
		| 'alternate'
		| 'moon'
		| 'purple'
		| 'solarized'
		| 'bluePlanet'
		| 'deepSpace'
		| 'saturn'
		| 'kepler'
		| 'elysiajs'
		| 'fastify'
		| 'mars'
		| 'laserwave'
		| 'none'
}

import type { NestInterceptor } from '@nestjs/common'
import type { ConfigService } from '@turystack/nestjs-config'

/**
 * Options for {@link Server.create}.
 *
 * @example
 * ```ts
 * Server.create(AppModule, (config) => ({
 *   port: config.get('PORT'),
 *   title: 'My API',
 *   description: 'My API description',
 *   docs: { provider: 'scalar', favicon: 'https://example.com/favicon.ico' },
 * }))
 * ```
 */
export type ServerOptions = {
	/** Server port. */
	port: number
	/** API title (used in Swagger docs and health endpoint). */
	title: string
	/** API description (Swagger). */
	description: string
	/** API version. Defaults to `'1.0'`. */
	version?: string
	/** Global route prefix. Defaults to `'api'`. */
	globalPrefix?: string
	/** Health endpoint response message. Defaults to `'${title} is running'`. */
	healthMessage?: string
	/** API reference UI configuration. When omitted, no reference UI is served. */
	docs?: DocsReferenceOptions
	/** API projects — each generates its own OpenAPI doc and Scalar reference. */
	projects?: ApiProject[]
	/** Extra global interceptors registered before the built-in response transforms. */
	interceptors?: NestInterceptor[]
}

/**
 * Static options or a factory resolved after Nest bootstraps.
 *
 * The factory receives the typed `ConfigService` registered by
 * `ConfigModule.register({ schema })`.
 */
export type ServerOptionsInput =
	| ServerOptions
	| ((config: ConfigService) => ServerOptions)
