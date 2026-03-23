import {
  applyDecorators,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Put,
  Version,
} from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { createZodDto } from 'nestjs-zod'
import type { z } from 'zod'

import { toJsonSchema } from '@/openapi'

type DtoClass = ReturnType<typeof createZodDto>

/** Zod schemas for request validation (params, query, body, headers). */
export type RouteParameters = {
  /** Header validation schema. */
  headers?: z.ZodObject<z.ZodRawShape>
  /** URL path-parameter validation schema. */
  params?: z.ZodObject<z.ZodRawShape>
  /** Query-string validation schema. Supports intersections for composed schemas. */
  query?:
    | z.ZodObject<z.ZodRawShape>
    | z.ZodIntersection<z.ZodSchema, z.ZodSchema>
  /** Request body validation schema. */
  body?: z.ZodSchema
}

/** Response schemas keyed by HTTP status code. */
type RouteResponses = {
  /** Success response schema. */
  200?: z.ZodSchema
  /** Created response schema. */
  201?: z.ZodSchema
  /** No Content response description. */
  204?: { description: string }
  /** Not Found error description(s). */
  404?: { description: string } | { description: string }[]
  /** Conflict error description(s). */
  409?: { description: string }[]
}

/**
 * Options for the {@link Route} decorator.
 *
 * @example
 * ```ts
 * @Route({
 *   method: 'GET',
 *   path: ':id',
 *   summary: 'Get User',
 *   description: 'Returns a single user by ID',
 *   parameters: { params: schema.params },
 *   responses: { 200: UserResponseSchema },
 * })
 * ```
 */
type RouteOptions = {
  /** API version number. Defaults to `1`. */
  version?: number
  /** Route path (appended to the controller prefix). */
  path?: string
  /** HTTP method. */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Swagger operation summary. */
  summary: string
  /** Swagger operation description. */
  description: string
  /** Request validation schemas. */
  parameters?: RouteParameters
  /** Response schemas by status code. */
  responses?: RouteResponses
}

const HTTP_METHOD_DECORATORS = {
  DELETE: Delete,
  GET: Get,
  PATCH: Patch,
  POST: Post,
  PUT: Put,
} as const

function toPascalCase(str: string) {
  return str.replace(/\s+/g, '')
}

function createNamedDto(schema: z.ZodSchema, name: string): DtoClass {
  const DtoClass = createZodDto(schema)
  Object.defineProperty(DtoClass, 'name', { value: name })
  return DtoClass
}

const createErrorSchema = (
  statusCode: number,
  extraProperties?: Record<string, unknown>,
) => ({
  properties: {
    message: { type: 'string' },
    statusCode: { enum: [statusCode], type: 'number' },
    ...extraProperties,
  },
  required: ['message', 'statusCode'],
  type: 'object',
})

const ERROR_SCHEMAS = {
  400: createErrorSchema(400, {
    errors: {
      items: {
        properties: {
          message: { type: 'string' },
          path: { type: 'string' },
        },
        required: ['message', 'path'],
        type: 'object',
      },
      type: 'array',
    },
  }),
  404: createErrorSchema(404, {
    resourceId: {
      description:
        'The identifier of the resource that was not found. Present on single-resource lookups.',
      type: 'string',
    },
    resourceIds: {
      description:
        'The identifiers of the resources that were not found. Present on batch lookups.',
      items: { type: 'string' },
      type: 'array',
    },
  }),
  409: createErrorSchema(409),
  500: createErrorSchema(500),
} as const

type ParamDecoratorsResult = {
  decorators: MethodDecorator[]
  dtoClass: DtoClass
}

function createParamDecorators(
  params: z.ZodObject<z.ZodRawShape>,
  summary: string,
): ParamDecoratorsResult {
  const shape = params.shape
  const baseName = toPascalCase(summary)
  const dtoClass = createNamedDto(params, `${baseName}Params`)

  const decorators = Object.entries(shape).map(([name, schema]) => {
    const jsonSchema = toJsonSchema(schema as z.ZodSchema)
    return ApiParam({ name, schema: jsonSchema })
  })

  return { decorators, dtoClass }
}

function extractPropertiesFromSchema(schema: SchemaObject): {
  properties: Record<string, SchemaObject>
  required: string[]
} {
  let properties: Record<string, SchemaObject> = {}
  let required: string[] = []

  if (schema.properties) {
    properties = {
      ...properties,
      ...(schema.properties as Record<string, SchemaObject>),
    }
  }

  if (schema.required) {
    required = [...required, ...(schema.required as string[])]
  }

  if (schema.allOf) {
    for (const item of schema.allOf) {
      const nested = extractPropertiesFromSchema(item as SchemaObject)
      properties = { ...properties, ...nested.properties }
      required = [...required, ...nested.required]
    }
  }

  return { properties, required }
}

type QueryDecoratorsResult = {
  decorators: MethodDecorator[]
  dtoClass: DtoClass
}

function createQueryDecorators(
  query:
    | z.ZodObject<z.ZodRawShape>
    | z.ZodIntersection<z.ZodSchema, z.ZodSchema>,
  summary: string,
): QueryDecoratorsResult {
  const jsonSchema = toJsonSchema(query)
  const { properties, required } = extractPropertiesFromSchema(jsonSchema)
  const baseName = toPascalCase(summary)
  const dtoClass = createNamedDto(query, `${baseName}Query`)

  const decorators = Object.entries(properties).map(([name, propSchema]) => {
    const hasDefault = 'default' in propSchema
    const isRequired = !hasDefault && required.includes(name)

    return ApiQuery({
      name,
      required: isRequired,
      schema: propSchema,
    })
  })

  return { decorators, dtoClass }
}

function createHeaderDecorators(
  headers: z.ZodObject<z.ZodRawShape>,
): MethodDecorator[] {
  const shape = headers.shape

  return Object.entries(shape).map(([name, schema]) => {
    const jsonSchema = toJsonSchema(schema as z.ZodSchema)
    const isRequired = !(schema as z.ZodSchema).isOptional()

    return ApiHeader({
      description: jsonSchema.description,
      name,
      required: isRequired,
      schema: jsonSchema,
    })
  })
}

type BodyDecoratorResult = {
  decorator: MethodDecorator
  dtoClass: DtoClass
}

function createBodyDecorator(
  body: z.ZodSchema,
  summary: string,
): BodyDecoratorResult {
  const baseName = toPascalCase(summary)
  const dtoClass = createNamedDto(body, `${baseName}Body`)

  const decorator = ApiBody({ schema: { $ref: getSchemaPath(dtoClass) } })

  return { decorator, dtoClass }
}

type ResponseDecoratorsResult = {
  decorators: MethodDecorator[]
  dtoClass?: DtoClass
}

function createResponseDecorators(
  responses: RouteResponses,
  summary: string,
): ResponseDecoratorsResult {
  const decorators: MethodDecorator[] = []
  let dtoClass: DtoClass | undefined

  if (responses[200]) {
    const baseName = toPascalCase(summary)
    dtoClass = createNamedDto(responses[200], `${baseName}Response`)
    decorators.push(
      ApiResponse({
        content: {
          'application/json': { schema: { $ref: getSchemaPath(dtoClass) } },
        },
        description: 'OK',
        status: 200,
      }),
    )
  }

  if (responses[201]) {
    const baseName = toPascalCase(summary)
    dtoClass = createNamedDto(responses[201], `${baseName}Response`)
    decorators.push(
      ApiResponse({
        content: {
          'application/json': { schema: { $ref: getSchemaPath(dtoClass) } },
        },
        description: 'Created',
        status: 201,
      }),
    )
  }

  if (responses[204]) {
    decorators.push(
      ApiResponse({
        content: {
          'application/json': {
            examples: {
              [`204-${responses[204].description}`]: {
                summary: responses[204].description,
              },
            },
          },
        },
        description: responses[204].description,
        status: 204,
      }),
    )
  }

  if (responses[404]) {
    const definition = responses[404]
    const parsedDefinitions = Array.isArray(definition)
      ? definition
      : [definition]

    const examples = parsedDefinitions.reduce(
      (acc, item, index) => {
        acc[`404-${item.description}-${index + 1}`] = {
          summary: item.description,
          value: {
            message: item.description,
            resourceId: '<resource-id>',
            statusCode: 404,
          },
        }
        return acc
      },
      {} as Record<string, { summary: string; value: object }>,
    )

    decorators.push(
      ApiResponse({
        content: {
          'application/json': {
            examples,
            schema: ERROR_SCHEMAS[404],
          },
        },
        description: 'Not Found Error',
        status: 404,
      }),
    )
  }

  if (responses[409]) {
    const definition = responses[409]
    const examples = definition.reduce(
      (acc, item, index) => {
        acc[`409-${item.description}-${index + 1}`] = {
          summary: item.description,
          value: { message: item.description, statusCode: 409 },
        }
        return acc
      },
      {} as Record<string, { summary: string; value: object }>,
    )

    decorators.push(
      ApiResponse({
        content: {
          'application/json': {
            examples,
            schema: ERROR_SCHEMAS[409],
          },
        },
        description: 'Conflict Error',
        status: 409,
      }),
    )
  }

  return { decorators, dtoClass }
}

function createDefaultErrorResponses() {
  const decorators: MethodDecorator[] = []

  decorators.push(
    ApiResponse({
      content: {
        'application/json': {
          example: {
            errors: [{ message: 'required', path: 'name' }],
            message: 'Bad Request Error',
            statusCode: 400,
          },
          schema: ERROR_SCHEMAS[400],
        },
      },
      description: 'Bad Request Error',
      status: 400,
    }),
  )

  decorators.push(
    ApiResponse({
      content: {
        'application/json': {
          example: {
            message: 'Internal Server Error',
            statusCode: 500,
          },
          schema: ERROR_SCHEMAS[500],
        },
      },
      description: 'Internal Server Error',
      status: 500,
    }),
  )

  return decorators
}

function getHttpStatusCode(responses?: RouteResponses): number {
  if (!responses) {
    return 204
  }

  const successCodes = [200, 201, 204]
  for (const code of successCodes) {
    if (code in responses) {
      return code
    }
  }

  return 204
}

/**
 * Method decorator combining HTTP method, Swagger docs, and Zod validation in one.
 *
 * Automatically generates Swagger `@ApiParam`, `@ApiQuery`, `@ApiBody`, `@ApiResponse`,
 * and `@ApiExtraModels` decorators from the provided Zod schemas.
 * Also registers default 400 and 500 error responses.
 *
 * @example
 * ```ts
 * import { Route } from 'aw-backend/server'
 *
 * @Route({
 *   method: 'POST',
 *   path: ':id/activate',
 *   summary: 'Activate User',
 *   description: 'Activates a user by ID',
 *   parameters: { params: z.object({ id: z.string().uuid() }) },
 *   responses: { 200: UserResponseSchema },
 * })
 * async activateUser() {}
 * ```
 */
export function Route(options: RouteOptions): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const { path, method, summary, description, parameters, responses } =
      options

    const operationId = String(propertyKey)
    const dtoClasses: DtoClass[] = []

    const HttpMethodDecorator = HTTP_METHOD_DECORATORS[method]
    const decorators: MethodDecorator[] = [
      HttpMethodDecorator(path),
      ApiOperation({ description, operationId, summary }),
    ]

    const httpCode = getHttpStatusCode(responses)
    decorators.push(HttpCode(httpCode))

    if (parameters?.headers) {
      const headerDecorators = createHeaderDecorators(parameters.headers)
      decorators.push(...headerDecorators)
    }

    if (parameters?.params) {
      const { decorators: paramDecorators, dtoClass } = createParamDecorators(
        parameters.params,
        summary,
      )
      decorators.push(...paramDecorators)
      dtoClasses.push(dtoClass)
    }

    if (parameters?.query) {
      const { decorators: queryDecorators, dtoClass } = createQueryDecorators(
        parameters.query,
        summary,
      )
      decorators.push(...queryDecorators)
      dtoClasses.push(dtoClass)
    }

    if (parameters?.body) {
      const { decorator, dtoClass } = createBodyDecorator(
        parameters.body,
        summary,
      )
      decorators.push(decorator)
      dtoClasses.push(dtoClass)
    }

    if (responses) {
      const { decorators: responseDecorators, dtoClass } =
        createResponseDecorators(responses, summary)
      decorators.push(...responseDecorators)
      if (dtoClass) {
        dtoClasses.push(dtoClass)
      }
    }

    decorators.push(...createDefaultErrorResponses())

    if (dtoClasses.length > 0) {
      decorators.push(ApiExtraModels(...dtoClasses))
    }

    const version = options.version ?? 1

    decorators.push(Version(version.toString().replace('v', '')))

    return applyDecorators(...decorators)(target, propertyKey, descriptor)
  }
}
