import type { OpenAPIObject } from '@nestjs/swagger'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
	applyComponentRefs,
	cleanSchema,
	createOpenApiDocument,
	filterDocumentByPrefix,
	registerComponentSchema,
	toJsonSchema,
} from '@/openapi/openapi.utils.js'

function collectReferences(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.flatMap(collectReferences)
	}

	if (value && typeof value === 'object') {
		const record = value as Record<string, unknown>
		const reference =
			typeof record.$ref === 'string'
				? [
						record.$ref,
					]
				: []

		return [
			...reference,
			...Object.values(record).flatMap(collectReferences),
		]
	}

	return []
}

function hasLocalDefinitions(value: unknown): boolean {
	if (Array.isArray(value)) {
		return value.some(hasLocalDefinitions)
	}

	if (value && typeof value === 'object') {
		const record = value as Record<string, unknown>
		return (
			'$defs' in record ||
			'definitions' in record ||
			Object.values(record).some(hasLocalDefinitions)
		)
	}

	return false
}

describe('toJsonSchema', () => {
	it('resolves local JSON definitions before publishing the schema', () => {
		const schema = toJsonSchema(
			z.object({
				payload: z.json().nullable(),
			}),
		)

		expect(hasLocalDefinitions(schema)).toBe(false)
		expect(
			collectReferences(schema).filter(
				(reference) =>
					reference.startsWith('#/$defs') ||
					reference.startsWith('#/definitions'),
			),
		).toEqual([])
	})

	it('converts nullable JSON Schema unions to OpenAPI 3 nullable fields', () => {
		const schema = toJsonSchema(z.string().nullable())

		expect(schema).toMatchObject({
			nullable: true,
			type: 'string',
		})
		expect(collectReferences(schema)).toEqual([])
		expect(JSON.stringify(schema)).not.toContain('"type":"null"')
	})

	it('converts JSON Schema const values to OpenAPI 3 enums', () => {
		const schema = toJsonSchema(z.literal('ACTIVE'))

		expect(schema).toMatchObject({
			enum: [
				'ACTIVE',
			],
		})
		expect(schema).not.toHaveProperty('const')
	})

	it('removes JSON Schema propertyNames for OpenAPI 3 compatibility', () => {
		const schema = toJsonSchema(z.record(z.string(), z.unknown()))

		expect(schema).not.toHaveProperty('propertyNames')
	})

	it('converts numeric exclusive bounds to OpenAPI 3 boolean bounds', () => {
		const schema = toJsonSchema(z.number().gt(0).lt(10))

		expect(schema).toMatchObject({
			exclusiveMaximum: true,
			exclusiveMinimum: true,
			maximum: 10,
			minimum: 0,
		})
	})
})

describe('createOpenApiDocument', () => {
	it('publishes request bodies and responses through reusable component references', () => {
		const document = createOpenApiDocument({
			components: {},
			info: {
				title: 'Test API',
				version: '1.0.0',
			},
			openapi: '3.0.0',
			paths: {
				'/test': {
					post: {
						operationId: 'createTest',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										properties: {
											name: {
												type: 'string',
											},
										},
										required: [
											'name',
										],
										type: 'object',
									},
								},
							},
							required: true,
						},
						responses: {
							201: {
								description: 'Created',
							},
						},
					},
				},
			},
		} as OpenAPIObject)

		expect(document.paths['/test']?.post?.requestBody).toEqual({
			$ref: '#/components/requestBodies/CreateTestRequestBody',
		})
		expect(document.paths['/test']?.post?.responses?.[201]).toEqual({
			$ref: '#/components/responses/CreateTest201Response',
		})
		expect(
			document.components?.requestBodies?.CreateTestRequestBody,
		).toMatchObject({
			required: true,
		})
		expect(document.components?.responses?.CreateTest201Response).toMatchObject(
			{
				description: 'Created',
			},
		)
	})
})

describe('registerComponentSchema + applyComponentRefs', () => {
	it('rewrites top-level array responses to $ref of the registered schema', () => {
		const itemSchema = z.object({
			id: z.string(),
			name: z.string(),
		})
		registerComponentSchema('RegisteredItem', toJsonSchema(itemSchema))

		const document = {
			info: {
				title: 'T',
				version: '1',
			},
			openapi: '3.0.0',
			paths: {
				'/items': {
					get: {
						responses: {
							200: {
								content: {
									'application/json': {
										schema: {
											items: toJsonSchema(itemSchema),
											type: 'array',
										},
									},
								},
							},
						},
					},
				},
			},
		} as unknown as Parameters<typeof applyComponentRefs>[0]

		const result = applyComponentRefs(document)

		const response = result.paths['/items']?.get?.responses?.[200]
		const schema = (
			response as {
				content: Record<
					string,
					{
						schema: {
							items: {
								$ref?: string
							}
						}
					}
				>
			}
		).content['application/json'].schema
		expect(schema.items.$ref).toBe('#/components/schemas/RegisteredItem')

		// the registered schema is merged into components by the full pipeline
		const full = createOpenApiDocument(document)
		expect(full.components?.schemas).toHaveProperty('RegisteredItem')
	})
})

describe('filterDocumentByPrefix', () => {
	const document = {
		components: {
			requestBodies: {
				AdminBody: {},
				UnusedBody: {},
			},
			responses: {
				AdminResponse: {},
				UnusedResponse: {},
			},
			schemas: {
				AdminThing: {},
				BillingSummary: {},
				ExtraModel: {},
			},
		},
		info: {
			title: 'Root',
			version: '1',
		},
		openapi: '3.0.0',
		paths: {
			'/api/v1/admin/users': {
				post: {
					requestBody: {
						$ref: '#/components/requestBodies/AdminBody',
					},
					responses: {
						200: {
							$ref: '#/components/responses/AdminResponse',
						},
					},
					tags: [
						'AdminUsers',
					],
				},
			},
			'/api/v1/billing': {
				get: {
					responses: {
						200: {
							content: {
								'application/json': {
									schema: {
										$ref: '#/components/schemas/BillingSummary',
									},
								},
							},
						},
					},
					tags: [
						'Billing',
					],
				},
			},
		},
		tags: [
			{
				name: 'Billing',
			},
			{
				name: 'AdminUsers',
			},
		],
	} as unknown as Parameters<typeof filterDocumentByPrefix>[0]

	it('keeps only the prefixed paths with their tags, schemas, and bodies', () => {
		const result = filterDocumentByPrefix(
			document,
			{
				name: 'admin',
				prefix: 'admin',
				title: 'Admin API',
			},
			[
				'admin',
			],
		)

		expect(Object.keys(result.paths)).toEqual([
			'/api/v1/admin/users',
		])
		expect(result.info.title).toBe('Admin API')
		expect(result.tags).toEqual([
			{
				name: 'AdminUsers',
			},
		])
		expect(Object.keys(result.components?.schemas ?? {})).toEqual([])
		expect(
			Object.keys(
				(
					result.components as {
						requestBodies?: Record<string, unknown>
					}
				)?.requestBodies ?? {},
			),
		).toEqual([
			'AdminBody',
		])
		expect(
			Object.keys(
				(
					result.components as {
						responses?: Record<string, unknown>
					}
				)?.responses ?? {},
			),
		).toEqual([
			'AdminResponse',
		])
	})

	it('gives unprefixed paths to the default project and keeps extra schemas', () => {
		const result = filterDocumentByPrefix(
			document,
			{
				name: 'main',
				title: 'Main API',
			},
			[
				'admin',
			],
			[
				'ExtraModel',
			],
		)

		expect(Object.keys(result.paths)).toEqual([
			'/api/v1/billing',
		])
		expect(Object.keys(result.components?.schemas ?? {}).sort()).toEqual([
			'BillingSummary',
			'ExtraModel',
		])
		expect(result.tags).toEqual([
			{
				name: 'Billing',
			},
		])
	})
})

describe('toJsonSchema edge shapes', () => {
	it('cleans nested anyOf/oneOf compositions and nullable unions', () => {
		const schema = z.object({
			choice: z.union([
				z.object({
					kind: z.literal('a'),
				}),
				z.object({
					kind: z.literal('b'),
				}),
			]),
			maybe: z.string().nullable(),
			tags: z.array(z.string().min(1).max(5000)).optional(),
		})

		const result = toJsonSchema(schema)

		expect(result.type).toBe('object')
		expect(result.properties).toHaveProperty('choice')
		expect(result.properties).toHaveProperty('maybe')
	})

	it('supports input io for request schemas with defaults', () => {
		const schema = z.object({
			page: z.coerce.number().default(1),
		})

		const result = toJsonSchema(schema, 'input')

		expect(result.type).toBe('object')
	})
})

describe('filterDocumentByPrefix edge shapes', () => {
	it('skips non-operation path item members and handles missing components', () => {
		const document = {
			info: {
				title: 'Root',
				version: '1',
			},
			openapi: '3.0.0',
			paths: {
				'/api/v1/admin/things': {
					get: {
						responses: {},
					},
					parameters: [
						{
							in: 'path',
							name: 'x',
						},
					],
					summary: 'plain string member',
				},
			},
		} as unknown as Parameters<typeof filterDocumentByPrefix>[0]

		const result = filterDocumentByPrefix(
			document,
			{
				name: 'admin',
				prefix: 'admin',
				title: 'Admin API',
			},
			[
				'admin',
			],
		)

		expect(Object.keys(result.paths)).toEqual([
			'/api/v1/admin/things',
		])
		expect(result.tags).toEqual([])
	})
})

describe('cleanSchema nullable compositions', () => {
	it('collapses anyOf-with-null into nullable and keeps multiple variants', () => {
		const schema = {
			anyOf: [
				{
					type: 'null',
				},
				{
					properties: {
						a: {
							type: 'string',
						},
					},
					type: 'object',
				},
				{
					properties: {
						b: {
							type: 'string',
						},
					},
					type: 'object',
				},
			],
		} as Parameters<typeof cleanSchema>[0]

		const result = cleanSchema(schema)

		expect(result.nullable).toBe(true)
		expect(result.anyOf).toHaveLength(2)
	})

	it('inlines a single non-null variant and keeps $ref variants as a list', () => {
		const inlined = cleanSchema({
			anyOf: [
				{
					nullable: true,
				},
				{
					properties: {
						a: {
							type: 'string',
						},
					},
					type: 'object',
				},
			],
		} as Parameters<typeof cleanSchema>[0])
		expect(inlined.nullable).toBe(true)
		expect(inlined.anyOf).toBeUndefined()
		expect(inlined.type).toBe('object')

		const refKept = cleanSchema({
			oneOf: [
				{
					type: 'null',
				},
				{
					$ref: '#/components/schemas/Thing',
				},
			],
		} as Parameters<typeof cleanSchema>[0])
		expect(refKept.nullable).toBe(true)
		expect(refKept.oneOf).toHaveLength(1)
	})

	it('drops the composition entirely when only null variants exist', () => {
		const result = cleanSchema({
			oneOf: [
				{
					type: 'null',
				},
			],
		} as Parameters<typeof cleanSchema>[0])

		expect(result.nullable).toBe(true)
		expect(result.oneOf).toBeUndefined()
	})
})
