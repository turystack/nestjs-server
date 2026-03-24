import { BadRequestException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import type { z } from 'zod'

/**
 * Creates a `BadRequestException` with structured Zod validation errors.
 *
 * Response shape:
 * ```json
 * {
 *   "statusCode": 400,
 *   "message": "Bad Request Error",
 *   "errors": [{ "code": "invalid_type", "message": "Required", "path": "name" }]
 * }
 * ```
 */
export function createZodValidationException(error: unknown) {
	const zodError = error as z.ZodError

	const errors = zodError.issues.map((issue) => {
		return {
			code: issue.code,
			message: issue.message,
			path: issue.path.join('.'),
		}
	})

	return new BadRequestException({
		errors,
		message: 'Bad Request Error',
		statusCode: 400,
	})
}

/** Global validation pipe (auto-configured by {@link Server.create}). Uses {@link createZodValidationException} for error formatting. */
export const ZodValidationTransform = createZodValidationPipe({
	createValidationException: createZodValidationException,
})
