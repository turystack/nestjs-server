import {
  applyDecorators,
  Controller as NestController,
  type ControllerOptions as NestControllerOptions,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import type { z } from 'zod'

type SchemaDefinition = {
  schema: z.ZodSchema
}

/** Options for the {@link Controller} decorator. */
type ControllerOptions = NestControllerOptions & {
  /** Swagger tag name for grouping endpoints. */
  tag: string
  /** Extra Zod schemas to register as Swagger models (key = model name). */
  schemas?: Record<string, SchemaDefinition>
}

/**
 * Class decorator wrapping NestJS `@Controller` with Swagger tag and optional schema registration.
 *
 * @example
 * ```ts
 * import { Controller } from '@turystack/nestjs-server'
 *
 * @Controller({ prefix: 'users', tag: 'Users' })
 * class UsersController {}
 * ```
 */
export function Controller(options: ControllerOptions): ClassDecorator {
  const { tag, schemas, ...controllerOptions } = options

  const decorators: ClassDecorator[] = [
    NestController(controllerOptions),
    ApiTags(tag),
  ]

  if (schemas && Object.keys(schemas).length > 0) {
    const dtoClasses = Object.entries(schemas).map(([name, definition]) => {
      const DtoClass = createZodDto(definition.schema)
      Object.defineProperty(DtoClass, 'name', { value: name })
      return DtoClass
    })

    decorators.push(ApiExtraModels(...dtoClasses))
  }

  return applyDecorators(...decorators)
}
