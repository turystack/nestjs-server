import type { ExecutionContext } from '@nestjs/common'
import { BadRequestException } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
	createRequestSchema,
	requestFactory,
} from '@/decorators/request.decorator.js'

function createContext(request: Record<string, unknown>): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => request,
		}),
	} as unknown as ExecutionContext
}

describe('Request decorator', () => {
	describe('createRequestSchema', () => {
		it('should return the schema as-is', () => {
			const schema = createRequestSchema({
				params: z.object({
					id: z.string(),
				}),
			})

			const wide = schema as Record<string, unknown>
			expect(wide.params).toBeDefined()
			expect(wide.body).toBeUndefined()
			expect(wide.query).toBeUndefined()
			expect(wide.headers).toBeUndefined()
		})

		it('should preserve all schema parts', () => {
			const schema = createRequestSchema({
				body: z.object({
					name: z.string(),
				}),
				headers: z.object({
					'x-api-key': z.string(),
				}),
				params: z.object({
					id: z.string(),
				}),
				query: z.object({
					page: z.number(),
				}),
			})

			expect(schema.params).toBeDefined()
			expect(schema.body).toBeDefined()
			expect(schema.query).toBeDefined()
			expect(schema.headers).toBeDefined()
		})

		it('should work with empty schema', () => {
			const schema = createRequestSchema({})

			expect(schema).toEqual({})
		})
	})

	describe('parseRequestParams (via schema validation)', () => {
		it('should validate params schema correctly', () => {
			const schema = createRequestSchema({
				params: z.object({
					id: z.string().uuid(),
				}),
			})

			const validResult = schema.params?.safeParse({
				id: '123e4567-e89b-12d3-a456-426614174000',
			})

			expect(validResult.success).toBe(true)
		})

		it('should reject invalid params', () => {
			const schema = createRequestSchema({
				params: z.object({
					id: z.string().uuid(),
				}),
			})

			const invalidResult = schema.params?.safeParse({
				id: 'not-a-uuid',
			})

			expect(invalidResult.success).toBe(false)
		})

		it('should validate body schema', () => {
			const schema = createRequestSchema({
				body: z.object({
					email: z.string().email(),
					name: z.string().min(1),
				}),
			})

			const validResult = schema.body?.safeParse({
				email: 'test@example.com',
				name: 'John',
			})

			expect(validResult.success).toBe(true)
		})

		it('should reject invalid body', () => {
			const schema = createRequestSchema({
				body: z.object({
					email: z.string().email(),
				}),
			})

			const invalidResult = schema.body?.safeParse({
				email: 'not-an-email',
			})

			expect(invalidResult.success).toBe(false)
		})

		it('should validate query schema with optional fields', () => {
			const schema = createRequestSchema({
				query: z.object({
					limit: z.coerce.number().default(10),
					page: z.coerce.number().default(1),
					search: z.string().optional(),
				}),
			})

			const result = schema.query?.safeParse({})

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.limit).toBe(10)
				expect(result.data.page).toBe(1)
			}
		})

		it('should validate headers schema', () => {
			const schema = createRequestSchema({
				headers: z.object({
					'x-api-key': z.string().min(1),
				}),
			})

			const validResult = schema.headers?.safeParse({
				'x-api-key': 'my-key',
			})

			expect(validResult.success).toBe(true)
		})
	})

	describe('requestFactory', () => {
		it('should validate all declared parts and expose rawBody', () => {
			const schema = createRequestSchema({
				body: z.object({
					name: z.string(),
				}),
				params: z.object({
					id: z.string(),
				}),
				query: z.object({
					page: z.coerce.number().default(1),
				}),
			})

			const rawBody = Buffer.from('{}')
			const result = requestFactory(
				schema,
				createContext({
					body: {
						name: 'John',
					},
					headers: {
						'x-any': 'value',
					},
					params: {
						id: 'u1',
					},
					query: {},
					rawBody,
				}),
			)

			expect(result.params).toEqual({
				id: 'u1',
			})
			expect(result.body).toEqual({
				name: 'John',
			})
			expect(result.query).toEqual({
				page: 1,
			})
			expect(result.headers).toEqual({
				'x-any': 'value',
			})
			expect(result.rawBody).toBe(rawBody)
		})

		it('should validate headers when a headers schema is given', () => {
			const schema = createRequestSchema({
				headers: z.object({
					'x-api-key': z.string(),
				}),
			})

			const result = requestFactory(
				schema,
				createContext({
					headers: {
						extra: 'dropped-by-strip',
						'x-api-key': 'key-1',
					},
				}),
			)

			expect(result.headers).toEqual({
				'x-api-key': 'key-1',
			})
		})

		it('should pass through untouched when no schema is given', () => {
			const result = requestFactory(
				undefined,
				createContext({
					headers: {
						a: '1',
					},
				}),
			)

			expect(result.params).toBeUndefined()
			expect(result.body).toBeUndefined()
			expect(result.query).toBeUndefined()
			expect(result.headers).toEqual({
				a: '1',
			})
		})

		it('should throw a structured 400 on validation failure', () => {
			const schema = createRequestSchema({
				params: z.object({
					id: z.string().uuid(),
				}),
			})

			expect(() =>
				requestFactory(
					schema,
					createContext({
						headers: {},
						params: {
							id: 'not-a-uuid',
						},
					}),
				),
			).toThrow(BadRequestException)
		})
	})

	it('should resolve the client ip from x-forwarded-for', () => {
		const fromString = requestFactory(
			undefined,
			createContext({
				headers: {
					'x-forwarded-for': '203.0.113.7, 10.0.0.1',
				},
			}),
		)
		expect(fromString.ip).toBe('203.0.113.7')

		const fromArray = requestFactory(
			undefined,
			createContext({
				headers: {
					'x-forwarded-for': [
						'198.51.100.9',
						'10.0.0.1',
					],
				},
			}),
		)
		expect(fromArray.ip).toBe('198.51.100.9')

		const fromSocket = requestFactory(
			undefined,
			createContext({
				headers: {},
				ip: '192.0.2.1',
			}),
		)
		expect(fromSocket.ip).toBe('192.0.2.1')

		const missing = requestFactory(
			undefined,
			createContext({
				headers: {},
			}),
		)
		expect(missing.ip).toBeNull()
	})
})
