import type { OpenAPIObject } from '@nestjs/swagger'
import { describe, expect, it } from 'vitest'

import {
	ERROR_SCHEMAS,
	EXCEPTION_SCHEMA,
	EXCEPTION_SCHEMA_NAME,
	forbiddenApiResponse,
	registerExceptionComponentSchema,
	unauthorizedApiResponse,
} from '@/openapi/openapi.errors.js'
import { createOpenApiDocument } from '@/openapi/openapi.utils.js'

describe('openapi errors', () => {
	describe('ERROR_SCHEMAS', () => {
		it('should describe the standard error body per status', () => {
			for (const status of [
				400,
				401,
				403,
				404,
				409,
				500,
			] as const) {
				const schema = ERROR_SCHEMAS[status]
				expect(schema.type).toBe('object')
				expect(schema.required).toEqual([
					'message',
					'statusCode',
				])
				expect(schema.properties.statusCode).toEqual({
					enum: [
						status,
					],
					type: 'number',
				})
			}
		})

		it('should add the zod errors array to 400', () => {
			expect(ERROR_SCHEMAS[400].properties).toHaveProperty('errors')
		})

		it('should add resource identifiers to 404', () => {
			expect(ERROR_SCHEMAS[404].properties).toHaveProperty('resourceId')
			expect(ERROR_SCHEMAS[404].properties).toHaveProperty('resourceIds')
		})
	})

	describe('Exception component schema', () => {
		it('lands in components.schemas once registered', () => {
			registerExceptionComponentSchema()

			const document = createOpenApiDocument({
				info: {
					title: 'Test',
					version: '1.0',
				},
				openapi: '3.0.0',
				paths: {},
			} as OpenAPIObject)

			expect(
				document.components?.schemas?.[EXCEPTION_SCHEMA_NAME],
			).toBeDefined()
		})

		it('requires message and statusCode; code and per-status fields optional', () => {
			expect(EXCEPTION_SCHEMA.required).toEqual([
				'message',
				'statusCode',
			])
			expect(Object.keys(EXCEPTION_SCHEMA.properties)).toEqual([
				'code',
				'errors',
				'message',
				'resourceId',
				'resourceIds',
				'statusCode',
			])
		})
	})

	describe('response decorators', () => {
		it('should build applicable ApiResponse decorators', () => {
			class Controller {
				handler() {}
			}

			const descriptor = Object.getOwnPropertyDescriptor(
				Controller.prototype,
				'handler',
			) as PropertyDescriptor

			expect(() =>
				unauthorizedApiResponse()(Controller.prototype, 'handler', descriptor),
			).not.toThrow()
			expect(() =>
				forbiddenApiResponse()(Controller.prototype, 'handler', descriptor),
			).not.toThrow()
		})
	})
})
