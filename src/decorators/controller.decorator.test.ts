import 'reflect-metadata'

import { Controller as NestController } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Controller } from '@/decorators/controller.decorator'

vi.mock('@nestjs/common', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    applyDecorators:
      (...decorators: any[]) =>
      (target: any) => {
        for (const d of decorators) d(target)
        return target
      },
    Controller: vi.fn(() => () => {}),
  }
})

vi.mock('@nestjs/swagger', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    ApiExtraModels: vi.fn(() => () => {}),
    ApiTags: vi.fn(() => () => {}),
  }
})

describe('Controller decorator', () => {
  it('should apply NestController with options', () => {
    @Controller({ prefix: 'users', tag: 'Users' })
    class TestController {}

    expect(NestController).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: 'users' }),
    )
    expect(TestController).toBeDefined()
  })

  it('should apply ApiTags with tag name', () => {
    @Controller({ prefix: 'orders', tag: 'Orders' })
    class TestController {}

    expect(ApiTags).toHaveBeenCalledWith('Orders')
    expect(TestController).toBeDefined()
  })

  it('should register extra models when schemas provided', () => {
    const UserSchema = z.object({ id: z.string(), name: z.string() })

    @Controller({
      prefix: 'users',
      schemas: { UserResponse: { schema: UserSchema } },
      tag: 'Users',
    })
    class TestController {}

    expect(ApiExtraModels).toHaveBeenCalled()
    expect(TestController).toBeDefined()
  })

  it('should not register extra models when no schemas', () => {
    vi.mocked(ApiExtraModels).mockClear()

    @Controller({ prefix: 'items', tag: 'Items' })
    class TestController {}

    expect(ApiExtraModels).not.toHaveBeenCalled()
    expect(TestController).toBeDefined()
  })
})
