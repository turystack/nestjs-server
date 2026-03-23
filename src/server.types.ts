/** Configuration for the API reference UI (Scalar). */
export type DocsReferenceOptions = {
	/** Reference UI provider. */
	provider: 'scalar'
	/** Custom CSS overrides for the reference UI. */
	customCss?: string
	/** Favicon URL. */
	favicon?: string
	/** Browser tab title. */
	pageTitle: string
	/** UI theme. Defaults to `'moon'`. */
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
	/** Title displayed on the reference page. */
	title: string
}

/**
 * Options for {@link Server.create}.
 *
 * @example
 * ```ts
 * Server.create(AppModule, {
 *   port: 3200,
 *   title: 'My API',
 *   description: 'My API description',
 *   docs: { provider: 'scalar', pageTitle: 'My API', title: 'My API' },
 * })
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
}
