import type { OpenAPIObject } from '@nestjs/swagger'
import type {
	ReferenceObject,
	SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import { z } from 'zod'

/**
 * Recursively removes noisy OpenAPI properties (`pattern`, extreme `min`/`max` values)
 * from a schema object for cleaner Swagger output.
 */
export function cleanSchema(schema: SchemaObject): SchemaObject {
	const cleaned = {
		...schema,
	}

	delete cleaned.pattern

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

	return cleaned
}

/**
 * Converts a Zod schema to a cleaned JSON Schema (OpenAPI-compatible).
 *
 * @param schema - Any Zod schema.
 * @returns A cleaned {@link SchemaObject} suitable for Swagger.
 */
export function toJsonSchema(schema: z.ZodSchema): SchemaObject {
	const jsonSchema = z.toJSONSchema(schema) as SchemaObject

	return cleanSchema(jsonSchema)
}

/**
 * Cleans and normalizes an OpenAPI document.
 *
 * Runs `nestjs-zod` cleanup and then applies {@link cleanSchema} to all component schemas.
 */
export function createOpenApiDocument(document: OpenAPIObject): OpenAPIObject {
	const cleaned = cleanupOpenApiDoc(document)

	if (cleaned.components?.schemas) {
		cleaned.components.schemas = Object.fromEntries(
			Object.entries(cleaned.components.schemas).map(([name, schema]) => [
				name,
				cleanSchema(schema as SchemaObject),
			]),
		)
	}

	return cleaned
}
