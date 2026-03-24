import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { z } from 'zod'

import { createZodValidationException } from '@/transforms/index.js'

/** Zod schemas for each part of an incoming HTTP request. */
export type RequestSchema = {
  /** Query-string validation schema. */
  query?: z.ZodType
  /** URL path-parameter validation schema. */
  params?: z.ZodType
  /** Request body validation schema. */
  body?: z.ZodType
  /** Header validation schema. */
  headers?: z.ZodType
}

/**
 * Inferred type of a validated request.
 *
 * Use with the {@link Request} parameter decorator.
 *
 * @example
 * ```ts
 * const schema = createRequestSchema({
 *   params: z.object({ id: z.string().uuid() }),
 * })
 *
 * async handler(@Request(schema) req: RequestInput<typeof schema>) {
 *   req.params.id // string (validated)
 *   req.rawBody   // Buffer
 * }
 * ```
 */
export type RequestInput<
  T extends Omit<RequestSchema, 'request'> = RequestSchema,
> = {
  query: T['query'] extends z.ZodType ? z.infer<T['query']> : undefined
  params: T['params'] extends z.ZodType ? z.infer<T['params']> : undefined
  body: T['body'] extends z.ZodType ? z.infer<T['body']> : undefined
  headers: T['headers'] extends z.ZodType
    ? z.infer<T['headers']>
    : Record<string, string>
  /** Raw request body buffer (useful for webhook signature verification). */
  rawBody: Buffer
}

function parseRequestParams<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw createZodValidationException(result.error)
  }

  return result.data
}

/**
 * Identity helper that returns the schema as-is while preserving its type.
 * Use to define request schemas for {@link Request}.
 *
 * @example
 * ```ts
 * const schema = createRequestSchema({
 *   params: z.object({ id: z.string().uuid() }),
 *   body: z.object({ name: z.string() }),
 * })
 * ```
 */
export function createRequestSchema<T extends RequestSchema>(schema: T) {
  return schema
}

/**
 * Parameter decorator that parses and validates the incoming HTTP request
 * using the provided Zod schemas.
 *
 * Validates `params`, `query`, `body`, and `headers` independently and
 * throws a structured {@link BadRequestException} on validation failure.
 *
 * @param schema - Request schema created with {@link createRequestSchema}.
 *
 * @example
 * ```ts
 * import { Request, createRequestSchema, type RequestInput } from '@turystack/nestjs-server'
 *
 * const schema = createRequestSchema({
 *   params: z.object({ id: z.string().uuid() }),
 * })
 *
 * async getUser(@Request(schema) req: RequestInput<typeof schema>) {
 *   req.params.id // string (validated)
 * }
 * ```
 */
export const Request = <T extends RequestSchema>(schema?: T) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    const result: Record<string, unknown> = {
      body: undefined,
      headers: request.headers,
      params: undefined,
      query: undefined,
      rawBody: request.rawBody,
    }

    if (schema?.headers) {
      result.headers = parseRequestParams(schema.headers, request.headers)
    }

    if (schema?.params) {
      result.params = parseRequestParams(schema.params, request.params)
    }

    if (schema?.query) {
      result.query = parseRequestParams(schema.query, request.query)
    }

    if (schema?.body) {
      result.body = parseRequestParams(schema.body, request.body)
    }

    return result as RequestInput<T>
  })()
