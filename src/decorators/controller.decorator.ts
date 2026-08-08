import {
	applyDecorators,
	Controller as NestController,
	type ControllerOptions as NestControllerOptions,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import type { z } from 'zod'

import {
	registerComponentSchema,
	toJsonSchema,
} from '@/openapi/openapi.utils.js'

type SchemaDefinition = {
	schema: z.ZodSchema
}

/** Options for the {@link Controller} decorator. */
type ControllerOptions = NestControllerOptions & {
	/** Swagger tag name for grouping endpoints. */
	tag: string
	/** Route prefix prepended to all routes (e.g., `'ops'` → `api/v1/ops/...`). Core controllers omit this. */
	prefix?: string
	/** Extra Zod schemas to register as named OpenAPI models (key = model name). */
	schemas?: Record<string, SchemaDefinition>
}

/**
 * Class decorator wrapping NestJS `@Controller` with Swagger tag and optional schema registration.
 *
 * @example
 * ```ts
 * import { Controller } from '@/infrastructure/server/decorators/controller.decorator'
 *
 * @Controller({
 *   path: 'users',
 *   prefix: 'ops',
 *   tag: 'Users',
 *   schemas: { User: { schema: userResponse } },
 * })
 * class UsersController {}
 * ```
 */
export function Controller(options: ControllerOptions): ClassDecorator {
	const { tag, prefix, schemas, ...controllerOptions } = options

	if (prefix && controllerOptions.path) {
		controllerOptions.path = `${prefix}/${controllerOptions.path}`
	} else if (prefix) {
		controllerOptions.path = prefix
	}

	const decorators: ClassDecorator[] = [
		NestController(controllerOptions),
		ApiTags(tag),
	]

	if (schemas && Object.keys(schemas).length > 0) {
		const dtoClasses = Object.entries(schemas).map(([name, definition]) => {
			registerComponentSchema(name, toJsonSchema(definition.schema))

			const ModelClass = class {}
			Object.defineProperty(ModelClass, 'name', {
				value: name,
			})
			return ModelClass
		})

		decorators.push(ApiExtraModels(...dtoClasses))
	}

	return applyDecorators(...decorators)
}
