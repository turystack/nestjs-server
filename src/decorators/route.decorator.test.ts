import 'reflect-metadata'

import { ApiResponse } from '@nestjs/swagger'
import { createExceptions } from '@turystack/exceptions'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Route } from '@/decorators/route.decorator.js'

const API_RESPONSE_METADATA_KEY = (() => {
	class Probe {
		probe() {}
	}
	const descriptor = Object.getOwnPropertyDescriptor(Probe.prototype, 'probe')
	if (!descriptor) {
		throw new Error('probe descriptor missing')
	}
	ApiResponse({
		status: 200,
	})(Probe.prototype, 'probe', descriptor)

	const key = Reflect.getMetadataKeys(Probe.prototype.probe).find(
		(metadataKey) => String(metadataKey).includes('apiResponse'),
	)
	if (!key) {
		throw new Error('ApiResponse metadata key not found')
	}
	return key
})()

const exceptions = createExceptions((e) => ({
	order: e.module('order', {
		conflict: [
			'already_paid',
		],
	}),
	user: e.module('user', {
		conflict: [
			'email_taken',
		],
	}),
}))

describe('Route decorator', () => {
	it('should apply to a method without error', () => {
		class TestController {
			@Route({
				description: 'List all users',
				method: 'GET',
				path: '',
				summary: 'List Users',
			})
			async listUsers() {}
		}

		expect(TestController.prototype.listUsers).toBeDefined()
	})

	it('should work with POST method and body', () => {
		class TestController {
			@Route({
				description: 'Create a user',
				method: 'POST',
				parameters: {
					body: z.object({
						name: z.string(),
					}),
				},
				summary: 'Create User',
			})
			async createUser() {}
		}

		expect(TestController.prototype.createUser).toBeDefined()
	})

	it('should work with params and query', () => {
		class TestController {
			@Route({
				description: 'Get user by ID',
				method: 'GET',
				parameters: {
					params: z.object({
						id: z.string(),
					}),
					query: z.object({
						include: z.string().optional(),
					}),
				},
				path: ':id',
				summary: 'Get User',
			})
			async getUser() {}
		}

		expect(TestController.prototype.getUser).toBeDefined()
	})

	it('should work with headers', () => {
		class TestController {
			@Route({
				description: 'Protected endpoint',
				method: 'GET',
				parameters: {
					headers: z.object({
						'x-api-key': z.string(),
					}),
				},
				summary: 'Protected',
			})
			async protectedRoute() {}
		}

		expect(TestController.prototype.protectedRoute).toBeDefined()
	})

	it('should work with 200 response schema', () => {
		class TestController {
			@Route({
				description: 'Get user',
				method: 'GET',
				responses: {
					200: z.object({
						id: z.string(),
						name: z.string(),
					}),
				},
				summary: 'Get User',
			})
			async getUser() {}
		}

		expect(TestController.prototype.getUser).toBeDefined()
	})

	it('should work with 201 response schema', () => {
		class TestController {
			@Route({
				description: 'Create user',
				method: 'POST',
				responses: {
					201: z.object({
						id: z.string(),
					}),
				},
				summary: 'Create User',
			})
			async createUser() {}
		}

		expect(TestController.prototype.createUser).toBeDefined()
	})

	it('should work with 204 response', () => {
		class TestController {
			@Route({
				description: 'Delete user',
				method: 'DELETE',
				responses: {
					204: {
						description: 'User deleted',
					},
				},
				summary: 'Delete User',
			})
			async deleteUser() {}
		}

		expect(TestController.prototype.deleteUser).toBeDefined()
	})

	it('groups declared exception classes by their own status code', () => {
		class TestController {
			@Route({
				description: 'Get user',
				method: 'GET',
				responses: {
					200: z.object({
						id: z.string(),
					}),
					exceptions: [
						exceptions.user.notFound,
						exceptions.user.emailTaken,
						exceptions.order.alreadyPaid,
					],
				},
				summary: 'Get User',
			})
			async getUser() {}
		}

		const apiResponses = Reflect.getMetadata(
			API_RESPONSE_METADATA_KEY,
			TestController.prototype.getUser,
		) as Record<
			string,
			{
				content: Record<
					string,
					{
						examples: object
					}
				>
			}
		>

		const notFoundExamples =
			apiResponses['404'].content['application/json'].examples
		expect(Object.keys(notFoundExamples)).toEqual([
			'404-user.not_found-1',
		])

		const conflictExamples =
			apiResponses['409'].content['application/json'].examples
		expect(Object.keys(conflictExamples)).toEqual([
			'409-user.email_taken-1',
			'409-order.already_paid-2',
		])
	})

	it('should work with PUT method', () => {
		class TestController {
			@Route({
				description: 'Update user',
				method: 'PUT',
				summary: 'Update User',
			})
			async updateUser() {}
		}

		expect(TestController.prototype.updateUser).toBeDefined()
	})

	it('should work with PATCH method', () => {
		class TestController {
			@Route({
				description: 'Patch user',
				method: 'PATCH',
				summary: 'Patch User',
			})
			async patchUser() {}
		}

		expect(TestController.prototype.patchUser).toBeDefined()
	})

	it('should work with DELETE method', () => {
		class TestController {
			@Route({
				description: 'Delete user',
				method: 'DELETE',
				summary: 'Delete User',
			})
			async deleteUser() {}
		}

		expect(TestController.prototype.deleteUser).toBeDefined()
	})

	it('should accept custom version', () => {
		class TestController {
			@Route({
				description: 'V2 endpoint',
				method: 'GET',
				summary: 'V2 List',
				version: 2,
			})
			async listV2() {}
		}

		expect(TestController.prototype.listV2).toBeDefined()
	})

	it('should work with query as intersection type', () => {
		const paginationSchema = z.object({
			limit: z.number(),
			page: z.number(),
		})
		const filterSchema = z.object({
			status: z.string(),
		})

		class TestController {
			@Route({
				description: 'List with filters',
				method: 'GET',
				parameters: {
					query: z.intersection(paginationSchema, filterSchema),
				},
				summary: 'List Items',
			})
			async listItems() {}
		}

		expect(TestController.prototype.listItems).toBeDefined()
	})

	it('converts the :: custom-method syntax into an escaped colon path', () => {
		class TestController {
			@Route({
				description: 'Pays an invoice.',
				method: 'POST',
				path: ':invoiceId::pay',
				summary: 'Pay Invoice',
			})
			async pay() {}
		}

		expect(Reflect.getMetadata('path', TestController.prototype.pay)).toBe(
			':invoiceId\\:pay',
		)
	})

	it('converts a collection-level custom method', () => {
		class TestController {
			@Route({
				description: 'Generates a report.',
				method: 'POST',
				path: 'reports::generate',
				summary: 'Generate Report',
			})
			async generate() {}
		}

		expect(Reflect.getMetadata('path', TestController.prototype.generate)).toBe(
			'reports\\:generate',
		)
	})

	it('rejects a custom method on a non-POST route at decoration time', () => {
		expect(() => {
			class TestController {
				@Route({
					description: 'Pays an invoice.',
					method: 'GET',
					path: ':invoiceId::pay',
					summary: 'Pay Invoice',
				})
				async pay() {}
			}
			return TestController
		}).toThrow(
			"[Route] custom method path ':invoiceId::pay' requires method POST",
		)
	})

	it('leaves plain param paths untouched', () => {
		class TestController {
			@Route({
				description: 'Get user',
				method: 'GET',
				path: ':id',
				summary: 'Get User',
			})
			async getUser() {}
		}

		expect(Reflect.getMetadata('path', TestController.prototype.getUser)).toBe(
			':id',
		)
	})

	it('derives the 404 example with resourceId from the exception class', () => {
		class TestController {
			@Route({
				description: 'Get item',
				method: 'GET',
				responses: {
					200: z.object({
						id: z.string(),
					}),
					exceptions: [
						exceptions.order.notFound,
					],
				},
				summary: 'Get Item',
			})
			async getItem() {}
		}

		const apiResponses = Reflect.getMetadata(
			API_RESPONSE_METADATA_KEY,
			TestController.prototype.getItem,
		) as Record<
			string,
			{
				content: Record<
					string,
					{
						examples: Record<
							string,
							{
								value: object
							}
						>
					}
				>
			}
		>

		expect(
			apiResponses['404'].content['application/json'].examples[
				'404-order.not_found-1'
			].value,
		).toEqual({
			code: 'order.not_found',
			message: 'order.not_found',
			resourceId: '<resource-id>',
			statusCode: 404,
		})
	})

	it('references the named Exception component on every error response', () => {
		class TestController {
			@Route({
				description: 'Get item',
				method: 'GET',
				responses: {
					exceptions: [
						exceptions.order.notFound,
					],
				},
				summary: 'Get Item',
			})
			async getItem() {}
		}

		const apiResponses = Reflect.getMetadata(
			API_RESPONSE_METADATA_KEY,
			TestController.prototype.getItem,
		) as Record<
			string,
			{
				content: Record<
					string,
					{
						schema: {
							$ref?: string
						}
					}
				>
			}
		>

		for (const status of [
			'400',
			'404',
			'500',
		]) {
			expect(apiResponses[status].content['application/json'].schema).toEqual({
				$ref: '#/components/schemas/Exception',
			})
		}
	})
})
