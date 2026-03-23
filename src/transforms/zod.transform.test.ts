import { BadRequestException } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { createZodValidationException } from '@/transforms/zod.transform'

describe('createZodValidationException', () => {
  it('should create a BadRequestException', () => {
    const exception = createZodValidationException({
      issues: [
        {
          code: 'invalid_type',
          message: 'Invalid type',
          path: ['name'],
        },
      ],
    })

    expect(exception).toBeInstanceOf(BadRequestException)
  })

  it('should include formatted errors', () => {
    const schema = z.object({ name: z.string() })
    const result = schema.safeParse({ name: 123 })

    if (result.success) throw new Error('Expected failure')

    const exception = createZodValidationException(result.error)
    const response = exception.getResponse() as Record<string, unknown>

    expect(response.statusCode).toBe(400)
    expect(response.message).toBe('Bad Request Error')
    expect(Array.isArray(response.errors)).toBe(true)
  })

  it('should join nested paths with dot', () => {
    const schema = z.object({
      address: z.object({ city: z.string() }),
    })
    const result = schema.safeParse({ address: { city: 42 } })

    if (result.success) throw new Error('Expected failure')

    const exception = createZodValidationException(result.error)
    const response = exception.getResponse() as Record<string, unknown>
    const errors = response.errors as Array<{ path: string }>

    expect(errors[0].path).toBe('address.city')
  })

  it('should include error code and message per issue', () => {
    const schema = z.object({ email: z.string().email() })
    const result = schema.safeParse({ email: 'bad' })

    if (result.success) throw new Error('Expected failure')

    const exception = createZodValidationException(result.error)
    const response = exception.getResponse() as Record<string, unknown>
    const errors = response.errors as Array<{
      code: string
      message: string
      path: string
    }>

    expect(errors[0].code).toBeDefined()
    expect(errors[0].message).toBeDefined()
    expect(errors[0].path).toBe('email')
  })

  it('should handle multiple validation errors', () => {
    const schema = z.object({
      age: z.number(),
      name: z.string(),
    })
    const result = schema.safeParse({ age: 'bad', name: 123 })

    if (result.success) throw new Error('Expected failure')

    const exception = createZodValidationException(result.error)
    const response = exception.getResponse() as Record<string, unknown>
    const errors = response.errors as Array<unknown>

    expect(errors.length).toBeGreaterThanOrEqual(2)
  })
})
