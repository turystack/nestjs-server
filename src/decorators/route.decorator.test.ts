import 'reflect-metadata'

import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Route } from '@/decorators/route.decorator.js'

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
          body: z.object({ name: z.string() }),
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
          params: z.object({ id: z.string() }),
          query: z.object({ include: z.string().optional() }),
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
          headers: z.object({ 'x-api-key': z.string() }),
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
          200: z.object({ id: z.string(), name: z.string() }),
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
          201: z.object({ id: z.string() }),
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
          204: { description: 'User deleted' },
        },
        summary: 'Delete User',
      })
      async deleteUser() {}
    }

    expect(TestController.prototype.deleteUser).toBeDefined()
  })

  it('should work with 404 response', () => {
    class TestController {
      @Route({
        description: 'Get user',
        method: 'GET',
        responses: {
          200: z.object({ id: z.string() }),
          404: [{ description: 'User not found' }],
        },
        summary: 'Get User',
      })
      async getUser() {}
    }

    expect(TestController.prototype.getUser).toBeDefined()
  })

  it('should work with 409 response', () => {
    class TestController {
      @Route({
        description: 'Create user',
        method: 'POST',
        responses: {
          201: z.object({ id: z.string() }),
          409: [{ description: 'Email already exists' }],
        },
        summary: 'Create User',
      })
      async createUser() {}
    }

    expect(TestController.prototype.createUser).toBeDefined()
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
    const paginationSchema = z.object({ limit: z.number(), page: z.number() })
    const filterSchema = z.object({ status: z.string() })

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

  it('should work with single 404 object', () => {
    class TestController {
      @Route({
        description: 'Get item',
        method: 'GET',
        responses: {
          200: z.object({ id: z.string() }),
          404: { description: 'Item not found' },
        },
        summary: 'Get Item',
      })
      async getItem() {}
    }

    expect(TestController.prototype.getItem).toBeDefined()
  })
})
