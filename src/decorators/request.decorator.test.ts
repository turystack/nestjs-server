import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { createRequestSchema } from '@/decorators/request.decorator.js'

describe('Request decorator', () => {
  describe('createRequestSchema', () => {
    it('should return the schema as-is', () => {
      const schema = createRequestSchema({
        params: z.object({ id: z.string() }),
      })

      expect(schema.params).toBeDefined()
      expect(schema.body).toBeUndefined()
      expect(schema.query).toBeUndefined()
      expect(schema.headers).toBeUndefined()
    })

    it('should preserve all schema parts', () => {
      const schema = createRequestSchema({
        body: z.object({ name: z.string() }),
        headers: z.object({ 'x-api-key': z.string() }),
        params: z.object({ id: z.string() }),
        query: z.object({ page: z.number() }),
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
        params: z.object({ id: z.string().uuid() }),
      })

      const validResult = schema.params?.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
      })

      expect(validResult.success).toBe(true)
    })

    it('should reject invalid params', () => {
      const schema = createRequestSchema({
        params: z.object({ id: z.string().uuid() }),
      })

      const invalidResult = schema.params?.safeParse({ id: 'not-a-uuid' })

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
})
