import { ApiResponse } from '@nestjs/swagger'

import { registerComponentSchema } from '@/openapi/openapi.utils.js'

const createErrorSchema = (
	statusCode: number,
	extraProperties?: Record<string, unknown>,
) => ({
	properties: {
		code: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		statusCode: {
			enum: [
				statusCode,
			],
			type: 'number',
		},
		...extraProperties,
	},
	required: [
		'message',
		'statusCode',
	],
	type: 'object',
})

export const EXCEPTION_SCHEMA_NAME = 'Exception'

/** `$ref` used by every error response — the SDK generates one named type. */
export const EXCEPTION_SCHEMA_REF = {
	$ref: `#/components/schemas/${EXCEPTION_SCHEMA_NAME}`,
}

/**
 * The single named error model of the API: the body every error response
 * carries (`AppErrorTransform` shape). Status-specific fields are optional —
 * `errors[]` on validation (400), `resourceId(s)` on not-found (404).
 */
export const EXCEPTION_SCHEMA = {
	properties: {
		code: {
			description: 'Stable exception code from the application catalog.',
			type: 'string',
		},
		errors: {
			description: 'Field-level validation issues. Present on 400 responses.',
			items: {
				properties: {
					code: {
						type: 'string',
					},
					message: {
						type: 'string',
					},
					path: {
						type: 'string',
					},
				},
				required: [
					'code',
					'message',
					'path',
				],
				type: 'object',
			},
			type: 'array',
		},
		message: {
			type: 'string',
		},
		resourceId: {
			description:
				'The identifier of the resource that was not found. Present on single-resource lookups.',
			type: 'string',
		},
		resourceIds: {
			description:
				'The identifiers of the resources that were not found. Present on batch lookups.',
			items: {
				type: 'string',
			},
			type: 'array',
		},
		statusCode: {
			type: 'number',
		},
	},
	required: [
		'message',
		'statusCode',
	],
	type: 'object',
} as const

/**
 * Registers the `Exception` model as a named OpenAPI component. Called by
 * `Server.create` before the document is built, so every error `$ref`
 * resolves and the SDK generator emits a single `Exception` type.
 */
export function registerExceptionComponentSchema(): void {
	registerComponentSchema(
		EXCEPTION_SCHEMA_NAME,
		EXCEPTION_SCHEMA as unknown as Parameters<
			typeof registerComponentSchema
		>[1],
	)
}

export const ERROR_SCHEMAS = {
	400: createErrorSchema(400, {
		errors: {
			items: {
				properties: {
					code: {
						type: 'string',
					},
					message: {
						type: 'string',
					},
					path: {
						type: 'string',
					},
				},
				required: [
					'code',
					'message',
					'path',
				],
				type: 'object',
			},
			type: 'array',
		},
	}),
	401: createErrorSchema(401),
	403: createErrorSchema(403),
	404: createErrorSchema(404, {
		resourceId: {
			description:
				'The identifier of the resource that was not found. Present on single-resource lookups.',
			type: 'string',
		},
		resourceIds: {
			description:
				'The identifiers of the resources that were not found. Present on batch lookups.',
			items: {
				type: 'string',
			},
			type: 'array',
		},
	}),
	409: createErrorSchema(409),
	500: createErrorSchema(500),
} as const

export const unauthorizedApiResponse = () =>
	ApiResponse({
		content: {
			'application/json': {
				example: {
					message: 'Unauthorized.',
					statusCode: 401,
				},
				schema: EXCEPTION_SCHEMA_REF,
			},
		},
		description: 'Unauthorized',
		status: 401,
	})

export const forbiddenApiResponse = () =>
	ApiResponse({
		content: {
			'application/json': {
				example: {
					message: 'You are not authorized to perform this action.',
					statusCode: 403,
				},
				schema: EXCEPTION_SCHEMA_REF,
			},
		},
		description: 'Forbidden',
		status: 403,
	})
