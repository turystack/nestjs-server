import type { OpenAPIObject } from '@nestjs/swagger'
import type {
	OperationObject,
	ReferenceObject,
	RequestBodyObject,
	ResponseObject,
	SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import { z } from 'zod'

import type { ApiProject } from '@/server.types.js'

/**
 * Registry of named component schemas registered via `@Controller({ schemas })`,
 * keyed by a canonical fingerprint of their JSON Schema. Used to automatically
 * rewrite matching response bodies into `$ref`s — so the SDK generator names
 * the type (and array element types) correctly without per-route annotations.
 */
const componentSchemaRegistry = new Map<string, string>()
const componentSchemas = new Map<string, SchemaObject>()

type SchemaObjectWithLocalDefinitions = SchemaObject & {
	const?: unknown
	$defs?: Record<string, SchemaObject | ReferenceObject>
	definitions?: Record<string, SchemaObject | ReferenceObject>
	exclusiveMaximum?: boolean | number
	exclusiveMinimum?: boolean | number
	nullable?: boolean
	propertyNames?: SchemaObject | ReferenceObject
}

type ComponentsWithRequestBodies = NonNullable<OpenAPIObject['components']> & {
	requestBodies?: Record<string, RequestBodyObject | ReferenceObject>
	responses?: Record<string, ResponseObject | ReferenceObject>
}

type OperationWithRequestBody = OperationObject & {
	requestBody?: RequestBodyObject | ReferenceObject
	responses?: Record<string, ResponseObject | ReferenceObject>
}

/** Recursively strips cosmetic-only keys so structurally equal schemas match. */
function stripCosmetic(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(stripCosmetic)
	}

	if (value && typeof value === 'object') {
		const result: Record<string, unknown> = {}
		for (const [key, item] of Object.entries(value)) {
			if (key === 'description' || key === 'example' || key === 'title') {
				continue
			}
			result[key] = stripCosmetic(item)
		}
		return result
	}

	return value
}

/** Deterministic, key-sorted stringify for structural comparison. */
function stableStringify(value: unknown): string {
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(',')}]`
	}

	if (value && typeof value === 'object') {
		const entries = Object.keys(value as Record<string, unknown>)
			.sort()
			.map(
				(key) =>
					`${JSON.stringify(key)}:${stableStringify(
						(value as Record<string, unknown>)[key],
					)}`,
			)
		return `{${entries.join(',')}}`
	}

	return JSON.stringify(value)
}

function fingerprint(schema: SchemaObject | ReferenceObject): string {
	return stableStringify(stripCosmetic(schema))
}

function toPascalCase(value: string): string {
	const normalized = value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.trim()

	if (!normalized) {
		return 'Operation'
	}

	return normalized
		.split(' ')
		.filter(Boolean)
		.map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
		.join('')
}

function uniqueComponentName(
	baseName: string,
	components: Record<string, unknown>,
): string {
	let candidate = baseName
	let suffix = 2

	while (candidate in components) {
		candidate = `${baseName}${suffix}`
		suffix += 1
	}

	return candidate
}

/**
 * Registers a named component schema for automatic `$ref` rewriting.
 * Called by the `@Controller({ schemas })` decorator.
 */
export function registerComponentSchema(
	name: string,
	schema: SchemaObject,
): void {
	componentSchemaRegistry.set(fingerprint(schema), name)
	componentSchemas.set(name, schema)
}

function withRegisteredComponentSchemas(
	document: OpenAPIObject,
): OpenAPIObject {
	if (componentSchemas.size === 0) {
		return document
	}

	return {
		...document,
		components: {
			...document.components,
			schemas: {
				...(document.components?.schemas ?? {}),
				...Object.fromEntries(componentSchemas),
			},
		},
	}
}

function toComponentRef(
	schema: SchemaObject | ReferenceObject | undefined,
): ReferenceObject | undefined {
	if (!schema || typeof schema !== 'object' || '$ref' in schema) {
		return undefined
	}

	const name = componentSchemaRegistry.get(fingerprint(schema))
	return name
		? {
				$ref: `#/components/schemas/${name}`,
			}
		: undefined
}

/**
 * Rewrites **top-level array** response bodies whose element type matches a
 * registered component schema into `{ type: 'array', items: { $ref } }`.
 *
 * Scoped to arrays because the SDK generator mishandles inline top-level
 * array-of-object responses (collapses them to the element's enum). Object
 * responses already generate correctly inline, so they are left untouched to
 * avoid churning unrelated generated types.
 */
export function applyComponentRefs(document: OpenAPIObject): OpenAPIObject {
	for (const pathItem of Object.values(document.paths ?? {})) {
		for (const operation of Object.values(pathItem ?? {})) {
			if (typeof operation !== 'object' || operation === null) {
				continue
			}

			const responses = (
				operation as {
					responses?: Record<
						string,
						{
							content?: Record<
								string,
								{
									schema?: SchemaObject
								}
							>
						}
					>
				}
			).responses

			for (const response of Object.values(responses ?? {})) {
				const schema = response?.content?.['application/json']?.schema

				if (schema?.type !== 'array' || !schema.items) {
					continue
				}

				const itemRef = toComponentRef(schema.items as SchemaObject)
				if (itemRef) {
					schema.items = itemRef
				}
			}
		}
	}

	return document
}

function applyRequestBodyRefs(document: OpenAPIObject): OpenAPIObject {
	const components = {
		...(document.components ?? {}),
		requestBodies: {
			...((document.components as ComponentsWithRequestBodies | undefined)
				?.requestBodies ?? {}),
		},
	} as ComponentsWithRequestBodies

	for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
		for (const [method, operation] of Object.entries(pathItem ?? {})) {
			if (typeof operation !== 'object' || operation === null) {
				continue
			}

			const operationWithBody = operation as OperationWithRequestBody
			const requestBody = operationWithBody.requestBody

			if (
				!requestBody ||
				typeof requestBody !== 'object' ||
				'$ref' in requestBody
			) {
				continue
			}

			const operationId =
				typeof operationWithBody.operationId === 'string'
					? operationWithBody.operationId
					: `${method} ${path}`
			const componentName = uniqueComponentName(
				`${toPascalCase(operationId)}RequestBody`,
				components.requestBodies ?? {},
			)

			components.requestBodies ??= {}
			components.requestBodies[componentName] = requestBody
			operationWithBody.requestBody = {
				$ref: `#/components/requestBodies/${componentName}`,
			}
		}
	}

	return {
		...document,
		components,
	}
}

function applyResponseRefs(document: OpenAPIObject): OpenAPIObject {
	const components = {
		...(document.components ?? {}),
		responses: {
			...((document.components as ComponentsWithRequestBodies | undefined)
				?.responses ?? {}),
		},
	} as ComponentsWithRequestBodies

	for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
		for (const [method, operation] of Object.entries(pathItem ?? {})) {
			if (typeof operation !== 'object' || operation === null) {
				continue
			}

			const operationWithResponses = operation as OperationWithRequestBody
			const responses = operationWithResponses.responses ?? {}
			const operationId =
				typeof operationWithResponses.operationId === 'string'
					? operationWithResponses.operationId
					: `${method} ${path}`

			for (const [status, response] of Object.entries(responses)) {
				if (!response || typeof response !== 'object' || '$ref' in response) {
					continue
				}

				const componentName = uniqueComponentName(
					`${toPascalCase(operationId)}${status}Response`,
					components.responses ?? {},
				)

				components.responses ??= {}
				components.responses[componentName] = response
				responses[status] = {
					$ref: `#/components/responses/${componentName}`,
				}
			}
		}
	}

	return {
		...document,
		components,
	}
}

function decodeJsonPointerSegment(segment: string): string {
	return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function getLocalDefinitionName(reference: string): string | undefined {
	const localDefinitionPrefixes = [
		'#/$defs/',
		'#/definitions/',
	] as const
	const prefix = localDefinitionPrefixes.find((item) =>
		reference.startsWith(item),
	)

	if (!prefix) {
		return undefined
	}

	const [definitionName] = reference.slice(prefix.length).split('/')
	return decodeJsonPointerSegment(definitionName ?? '')
}

function resolveLocalDefinitionRefs(
	schema: SchemaObject | ReferenceObject,
	parentDefinitions: Record<string, SchemaObject | ReferenceObject> = {},
	visitedDefinitionNames: string[] = [],
): SchemaObject | ReferenceObject {
	const schemaWithDefinitions = schema as SchemaObjectWithLocalDefinitions
	const localDefinitions = {
		...parentDefinitions,
		...(schemaWithDefinitions.$defs ?? {}),
		...(schemaWithDefinitions.definitions ?? {}),
	}

	if ('$ref' in schema && typeof schema.$ref === 'string') {
		const definitionName = getLocalDefinitionName(schema.$ref)
		const definition = definitionName && localDefinitions[definitionName]

		if (definitionName && definition) {
			if (visitedDefinitionNames.includes(definitionName)) {
				return {}
			}

			const siblingSchema = Object.fromEntries(
				Object.entries(schema).filter(([key]) => key !== '$ref'),
			) as SchemaObject

			return {
				...(resolveLocalDefinitionRefs(definition, localDefinitions, [
					...visitedDefinitionNames,
					definitionName,
				]) as SchemaObject),
				...(resolveLocalDefinitionRefs(
					siblingSchema,
					localDefinitions,
					visitedDefinitionNames,
				) as SchemaObject),
			}
		}
	}

	return Object.fromEntries(
		Object.entries(schema).flatMap(([key, value]) => {
			if (key === '$defs' || key === 'definitions') {
				return []
			}

			if (Array.isArray(value)) {
				return [
					[
						key,
						value.map((item) =>
							item && typeof item === 'object'
								? resolveLocalDefinitionRefs(
										item as SchemaObject | ReferenceObject,
										localDefinitions,
										visitedDefinitionNames,
									)
								: item,
						),
					],
				]
			}

			if (value && typeof value === 'object') {
				return [
					[
						key,
						resolveLocalDefinitionRefs(
							value as SchemaObject | ReferenceObject,
							localDefinitions,
							visitedDefinitionNames,
						),
					],
				]
			}

			return [
				[
					key,
					value,
				],
			]
		}),
	) as SchemaObject | ReferenceObject
}

function isNullSchema(schema: SchemaObject | ReferenceObject): boolean {
	if ('$ref' in schema) {
		return false
	}

	if (schema.type === 'null') {
		return true
	}

	const keys = Object.keys(schema)
	return Boolean(schema.nullable) && keys.every((key) => key === 'nullable')
}

function normalizeNullableComposition(
	schema: SchemaObjectWithLocalDefinitions,
	key: 'anyOf' | 'oneOf',
): void {
	const variants = schema[key]

	if (!variants?.some((item) => isNullSchema(item as SchemaObject))) {
		return
	}

	const nonNullVariants = variants.filter(
		(item) => !isNullSchema(item as SchemaObject),
	) as Array<SchemaObject | ReferenceObject>

	schema.nullable = true

	if (nonNullVariants.length === 0) {
		delete schema[key]
		return
	}

	if (nonNullVariants.length !== 1 || '$ref' in nonNullVariants[0]) {
		schema[key] = nonNullVariants
		return
	}

	const [nonNullVariant] = nonNullVariants
	delete schema[key]

	Object.assign(schema, {
		...nonNullVariant,
		...schema,
		nullable: true,
	})
}

/**
 * Recursively removes noisy OpenAPI properties (`pattern`, extreme `min`/`max` values)
 * from a schema object for cleaner Swagger output.
 */
export function cleanSchema(schema: SchemaObject): SchemaObject {
	const schemaWithoutLocalDefinitions = resolveLocalDefinitionRefs(schema)
	const cleaned = {
		...schemaWithoutLocalDefinitions,
	} as SchemaObjectWithLocalDefinitions & {
		$schema?: string
	}

	delete cleaned.$schema
	delete cleaned.$defs
	delete cleaned.definitions
	delete cleaned.pattern
	delete cleaned.propertyNames

	if (cleaned.const !== undefined) {
		cleaned.enum ??= [
			cleaned.const,
		]
		delete cleaned.const
	}

	if (typeof cleaned.exclusiveMinimum === 'number') {
		cleaned.minimum ??= cleaned.exclusiveMinimum
		cleaned.exclusiveMinimum = true
	}

	if (typeof cleaned.exclusiveMaximum === 'number') {
		cleaned.maximum ??= cleaned.exclusiveMaximum
		cleaned.exclusiveMaximum = true
	}

	if (
		cleaned.minLength === 1 ||
		cleaned.minimum === 1 ||
		cleaned.maximum === 9007199254740991 ||
		cleaned.minimum === -9007199254740991
	) {
		delete cleaned.minLength
		delete cleaned.minimum
		delete cleaned.maximum
	}

	if (cleaned.properties) {
		cleaned.properties = Object.fromEntries(
			Object.entries(cleaned.properties).map(([key, value]) => [
				key,
				cleanSchema(value as SchemaObject),
			]),
		)
	}

	if (cleaned.items) {
		cleaned.items = cleanSchema(cleaned.items as SchemaObject)
	}

	if (cleaned.allOf) {
		cleaned.allOf = cleaned.allOf.map((item: SchemaObject | ReferenceObject) =>
			cleanSchema(item as SchemaObject),
		)
	}

	if (cleaned.anyOf) {
		cleaned.anyOf = cleaned.anyOf.map((item: SchemaObject | ReferenceObject) =>
			cleanSchema(item as SchemaObject),
		)
	}

	if (cleaned.oneOf) {
		cleaned.oneOf = cleaned.oneOf.map((item: SchemaObject | ReferenceObject) =>
			cleanSchema(item as SchemaObject),
		)
	}

	normalizeNullableComposition(cleaned, 'anyOf')
	normalizeNullableComposition(cleaned, 'oneOf')

	if (cleaned.type === 'null') {
		delete cleaned.type
		cleaned.nullable = true
	}

	return cleaned
}

/**
 * Converts a Zod schema to a cleaned JSON Schema (OpenAPI-compatible).
 *
 * @param schema - Any Zod schema.
 * @param io - `'input'` for requests (shows raw input of transforms/pipes),
 *   `'output'` for responses. Defaults to `'output'`.
 * @returns A cleaned {@link SchemaObject} suitable for Swagger.
 */
export function toJsonSchema(
	schema: z.ZodSchema,
	io: 'input' | 'output' = 'output',
): SchemaObject {
	const jsonSchema = z.toJSONSchema(schema, {
		io,
		unrepresentable: 'any',
	}) as SchemaObject

	return cleanSchema(jsonSchema)
}

/**
 * Cleans and normalizes an OpenAPI document.
 *
 * Runs `nestjs-zod` cleanup and then applies {@link cleanSchema} to all component schemas.
 */
/**
 * Filters an OpenAPI document to include only paths matching a project prefix.
 *
 * For projects with a prefix, includes paths starting with `/v1/{prefix}/`.
 * For the default project (no prefix), includes paths not claimed by any other prefix.
 * Also filters tags and component schemas to only those referenced by matching paths.
 */
export function filterDocumentByPrefix(
	document: OpenAPIObject,
	project: ApiProject,
	allPrefixes: string[],
	extraSchemaNames: string[] = [],
): OpenAPIObject {
	const { prefix } = project

	const filteredPaths: OpenAPIObject['paths'] = {}
	const usedTags = new Set<string>()
	const usedSchemaRefs = new Set<string>(extraSchemaNames)
	const usedRequestBodyRefs = new Set<string>()
	const usedResponseRefs = new Set<string>()

	for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
		const matches = prefix
			? path.includes(`/${prefix}/`)
			: allPrefixes.every((p) => !path.includes(`/${p}/`))

		if (!matches) {
			continue
		}

		filteredPaths[path] = pathItem

		for (const operation of Object.values(pathItem ?? {})) {
			if (typeof operation !== 'object' || operation === null) {
				continue
			}

			const op = operation as {
				tags?: string[]
			}
			for (const tag of op.tags ?? []) {
				usedTags.add(tag)
			}

			const json = JSON.stringify(pathItem)
			const refPattern = /"#\/components\/schemas\/([^"]+)"/g
			let match: RegExpExecArray | null

			while (true) {
				match = refPattern.exec(json)
				if (match === null) {
					break
				}
				usedSchemaRefs.add(match[1])
			}

			const requestBodyRefPattern = /"#\/components\/requestBodies\/([^"]+)"/g

			while (true) {
				match = requestBodyRefPattern.exec(json)
				if (match === null) {
					break
				}
				usedRequestBodyRefs.add(match[1])
			}

			const responseRefPattern = /"#\/components\/responses\/([^"]+)"/g

			while (true) {
				match = responseRefPattern.exec(json)
				if (match === null) {
					break
				}
				usedResponseRefs.add(match[1])
			}
		}
	}

	const requestBodies = (
		document.components as ComponentsWithRequestBodies | undefined
	)?.requestBodies
	const responses = (
		document.components as ComponentsWithRequestBodies | undefined
	)?.responses

	return {
		...document,
		components: {
			...document.components,
			requestBodies: requestBodies
				? Object.fromEntries(
						Object.entries(requestBodies).filter(([name]) =>
							usedRequestBodyRefs.has(name),
						),
					)
				: undefined,
			responses: responses
				? Object.fromEntries(
						Object.entries(responses).filter(([name]) =>
							usedResponseRefs.has(name),
						),
					)
				: undefined,
			schemas: Object.fromEntries(
				Object.entries(document.components?.schemas ?? {}).filter(([name]) =>
					usedSchemaRefs.has(name),
				),
			),
		},
		info: {
			...document.info,
			title: project.title,
		},
		paths: filteredPaths,
		tags: (document.tags ?? []).filter((t) => usedTags.has(t.name)),
	}
}

export function createOpenApiDocument(document: OpenAPIObject): OpenAPIObject {
	const documentWithComponents = withRegisteredComponentSchemas(document)
	const cleaned = cleanupOpenApiDoc(applyComponentRefs(documentWithComponents))

	if (cleaned.components?.schemas) {
		cleaned.components.schemas = Object.fromEntries(
			Object.entries(cleaned.components.schemas).map(([name, schema]) => [
				name,
				cleanSchema(schema as SchemaObject),
			]),
		)
	}

	return applyResponseRefs(applyRequestBodyRefs(cleaned))
}
