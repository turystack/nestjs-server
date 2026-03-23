import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
	cleanSchema,
	createOpenApiDocument,
	toJsonSchema,
} from '@/request.utils'

describe('request.utils', () => {
	describe('cleanSchema', () => {
		it('should remove pattern property', () => {
			const result = cleanSchema({
				pattern: '^[a-z]+$',
				type: 'string',
			})

			expect(result.pattern).toBeUndefined()
			expect(result.type).toBe('string')
		})

		it('should remove minLength when it equals 1', () => {
			const result = cleanSchema({
				minLength: 1,
				type: 'string',
			})

			expect(result.minLength).toBeUndefined()
		})

		it('should remove minimum when it equals 1', () => {
			const result = cleanSchema({
				minimum: 1,
				type: 'number',
			})

			expect(result.minimum).toBeUndefined()
		})

		it('should remove maximum when it equals MAX_SAFE_INTEGER', () => {
			const result = cleanSchema({
				maximum: 9007199254740991,
				type: 'number',
			})

			expect(result.maximum).toBeUndefined()
		})

		it('should remove minimum when it equals -MAX_SAFE_INTEGER', () => {
			const result = cleanSchema({
				minimum: -9007199254740991,
				type: 'number',
			})

			expect(result.minimum).toBeUndefined()
		})

		it('should keep minLength when it is not 1', () => {
			const result = cleanSchema({
				minLength: 5,
				type: 'string',
			})

			expect(result.minLength).toBe(5)
		})

		it('should clean nested properties recursively', () => {
			const result = cleanSchema({
				properties: {
					name: {
						minLength: 1,
						pattern: '^[a-z]+$',
						type: 'string',
					},
				},
				type: 'object',
			})

			const nameSchema = result.properties?.name as Record<string, unknown>

			expect(nameSchema.pattern).toBeUndefined()
			expect(nameSchema.minLength).toBeUndefined()
		})

		it('should clean items in array schemas', () => {
			const result = cleanSchema({
				items: {
					pattern: '^[a-z]+$',
					type: 'string',
				},
				type: 'array',
			})

			const items = result.items as Record<string, unknown>

			expect(items.pattern).toBeUndefined()
		})

		it('should clean allOf schemas', () => {
			const result = cleanSchema({
				allOf: [
					{
						pattern: '^[a-z]+$',
						type: 'string',
					},
				],
			})

			const first = result.allOf?.[0] as Record<string, unknown>

			expect(first.pattern).toBeUndefined()
		})

		it('should clean anyOf schemas', () => {
			const result = cleanSchema({
				anyOf: [
					{
						pattern: '^[a-z]+$',
						type: 'string',
					},
				],
			})

			const first = result.anyOf?.[0] as Record<string, unknown>

			expect(first.pattern).toBeUndefined()
		})

		it('should clean oneOf schemas', () => {
			const result = cleanSchema({
				oneOf: [
					{
						pattern: '^[a-z]+$',
						type: 'string',
					},
				],
			})

			const first = result.oneOf?.[0] as Record<string, unknown>

			expect(first.pattern).toBeUndefined()
		})

		it('should not mutate the original schema', () => {
			const original = {
				pattern: '^[a-z]+$',
				type: 'string',
			}
			cleanSchema(original)

			expect(original.pattern).toBe('^[a-z]+$')
		})
	})

	describe('toJsonSchema', () => {
		it('should convert a Zod string schema', () => {
			const result = toJsonSchema(z.string())

			expect(result.type).toBe('string')
		})

		it('should convert a Zod object schema', () => {
			const result = toJsonSchema(
				z.object({
					age: z.number(),
					name: z.string(),
				}),
			)

			expect(result.type).toBe('object')
			expect(result.properties).toBeDefined()
		})

		it('should clean the resulting schema', () => {
			const result = toJsonSchema(z.string().min(1))

			expect(result.minLength).toBeUndefined()
		})
	})

	describe('createOpenApiDocument', () => {
		it('should clean component schemas', () => {
			const document = {
				components: {
					schemas: {
						User: {
							properties: {
								name: {
									minLength: 1,
									pattern: '^[a-z]+$',
									type: 'string',
								},
							},
							type: 'object',
						},
					},
				},
				info: {
					title: 'Test',
					version: '1.0',
				},
				openapi: '3.0.0',
				paths: {},
			}

			const result = createOpenApiDocument(document as any)
			const nameSchema = (result.components?.schemas?.User as any)?.properties
				?.name

			expect(nameSchema?.pattern).toBeUndefined()
		})

		it('should handle document without components', () => {
			const document = {
				info: {
					title: 'Test',
					version: '1.0',
				},
				openapi: '3.0.0',
				paths: {},
			}

			const result = createOpenApiDocument(document as any)

			expect(result.info.title).toBe('Test')
		})
	})
})
