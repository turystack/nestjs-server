import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { firstValueFrom, of } from 'rxjs'
import { describe, expect, it } from 'vitest'

import { ResponseFieldsTransform } from './response-fields.transform.js'

function run(
	interceptor: ResponseFieldsTransform,
	value: unknown,
	fields?: string,
) {
	const handler: CallHandler = {
		handle: () => of(value),
	}
	const ctx = {
		switchToHttp: () => ({
			getRequest: () => ({
				query:
					fields !== undefined
						? {
								fields,
							}
						: {},
			}),
		}),
	} as unknown as ExecutionContext

	return firstValueFrom(interceptor.intercept(ctx, handler))
}

describe('ResponseFieldsTransform', () => {
	const interceptor = new ResponseFieldsTransform()

	it('passes through when fields is absent', async () => {
		const input = {
			email: 'a@b.c',
			id: '1',
			name: 'João',
		}
		await expect(run(interceptor, input)).resolves.toEqual(input)
	})

	it('passes through when fields is empty string', async () => {
		const input = {
			id: '1',
			name: 'João',
		}
		await expect(run(interceptor, input, '')).resolves.toEqual(input)
	})

	it('picks flat fields', async () => {
		const result = await run(
			interceptor,
			{
				email: 'a@b.c',
				id: '1',
				name: 'João',
			},
			'id,name',
		)
		expect(result).toEqual({
			id: '1',
			name: 'João',
		})
	})

	it('trims whitespace around tokens', async () => {
		const result = await run(
			interceptor,
			{
				email: 'a@b.c',
				id: '1',
				name: 'João',
			},
			' id , name ',
		)
		expect(result).toEqual({
			id: '1',
			name: 'João',
		})
	})

	it('picks nested fields via dot notation', async () => {
		const result = await run(
			interceptor,
			{
				id: '1',
				ignored: 'x',
				user: {
					email: 'a@b.c',
					id: 'u1',
					name: 'João',
				},
			},
			'id,user.email',
		)
		expect(result).toEqual({
			id: '1',
			user: {
				email: 'a@b.c',
			},
		})
	})

	it('projects through arrays of objects', async () => {
		const result = await run(
			interceptor,
			[
				{
					id: '1',
					name: 'a',
					secret: 'x',
				},
				{
					id: '2',
					name: 'b',
					secret: 'y',
				},
			],
			'id,name',
		)
		expect(result).toEqual([
			{
				id: '1',
				name: 'a',
			},
			{
				id: '2',
				name: 'b',
			},
		])
	})

	it('projects through deeply nested arrays', async () => {
		const result = await run(
			interceptor,
			{
				trips: [
					{
						id: 't1',
						route: {
							distance: 100,
							id: 'r1',
							name: 'R1',
						},
					},
					{
						id: 't2',
						route: {
							distance: 200,
							id: 'r2',
							name: 'R2',
						},
					},
				],
			},
			'trips.id,trips.route.id',
		)
		expect(result).toEqual({
			trips: [
				{
					id: 't1',
					route: {
						id: 'r1',
					},
				},
				{
					id: 't2',
					route: {
						id: 'r2',
					},
				},
			],
		})
	})

	it('drops unknown fields silently', async () => {
		const result = await run(
			interceptor,
			{
				id: '1',
				name: 'João',
			},
			'id,doesNotExist',
		)
		expect(result).toEqual({
			id: '1',
		})
	})

	it('auto-unwraps {data, meta} envelope and projects into data', async () => {
		const result = await run(
			interceptor,
			{
				data: [
					{
						extra: 'x',
						id: '1',
						name: 'a',
					},
					{
						extra: 'y',
						id: '2',
						name: 'b',
					},
				],
				meta: {
					page: 1,
					total: 2,
				},
			},
			'id,name',
		)
		expect(result).toEqual({
			data: [
				{
					id: '1',
					name: 'a',
				},
				{
					id: '2',
					name: 'b',
				},
			],
			meta: {
				page: 1,
				total: 2,
			},
		})
	})

	it('auto-unwrap preserves meta untouched even when meta keys overlap fields', async () => {
		const result = await run(
			interceptor,
			{
				data: {
					extra: 'x',
					id: '1',
					name: 'a',
				},
				meta: {
					id: 'meta-id',
					total: 1,
				},
			},
			'id',
		)
		expect(result).toEqual({
			data: {
				id: '1',
			},
			meta: {
				id: 'meta-id',
				total: 1,
			},
		})
	})

	it('projects through class instances (e.g. @Entity() objects)', async () => {
		class User {
			id!: string
			name!: string
			email!: string
		}
		const user = Object.assign(new User(), {
			email: 'a@b.c',
			id: 'u1',
			name: 'João',
		})

		const result = await run(interceptor, user, 'name')
		expect(result).toEqual({
			name: 'João',
		})
	})

	it('projects inside arrays of class instances', async () => {
		class User {
			id!: string
			name!: string
		}
		const users = [
			Object.assign(new User(), {
				id: '1',
				name: 'a',
			}),
			Object.assign(new User(), {
				id: '2',
				name: 'b',
			}),
		]

		const result = await run(interceptor, users, 'id')
		expect(result).toEqual([
			{
				id: '1',
			},
			{
				id: '2',
			},
		])
	})

	it('prefers deeper spec when both "user" and "user.email" are requested', async () => {
		const result = await run(
			interceptor,
			{
				user: {
					email: 'a@b.c',
					id: 'u1',
					name: 'João',
				},
			},
			'user,user.email',
		)
		expect(result).toEqual({
			user: {
				email: 'a@b.c',
			},
		})
	})

	it('should leave non-plain objects (Buffer, Map, Set, RegExp) untouched inside projections', async () => {
		const value = {
			buffer: Buffer.from('abc'),
			map: new Map(),
			pattern: /abc/,
			set: new Set(),
		}

		const result = (await run(
			interceptor,
			value,
			'buffer,map,set,pattern',
		)) as typeof value

		expect(result.buffer).toBeInstanceOf(Buffer)
		expect(result.map).toBeInstanceOf(Map)
		expect(result.set).toBeInstanceOf(Set)
		expect(result.pattern).toBeInstanceOf(RegExp)
	})

	it('should handle an array-valued fields query param', async () => {
		const handler = {
			handle: () =>
				of({
					id: '1',
					name: 'x',
					secretish: 'y',
				}),
		}
		const ctx = {
			switchToHttp: () => ({
				getRequest: () => ({
					query: {
						fields: [
							'id',
							'name',
						],
					},
				}),
			}),
		}
		const result = await firstValueFrom(
			interceptor.intercept(ctx as never, handler as never),
		)

		expect(result).toEqual({
			id: '1',
			name: 'x',
		})
	})

	it('should keep the deeper projection when a leaf and a deeper path are both given', async () => {
		const value = {
			user: {
				email: 'a@b.c',
				name: 'John',
				secretive: 'x',
			},
		}

		const deeperFirst = await run(interceptor, value, 'user.email,user')
		expect(deeperFirst).toEqual({
			user: {
				email: 'a@b.c',
			},
		})

		const leafFirst = await run(interceptor, value, 'user,user.email')
		expect(leafFirst).toEqual({
			user: {
				email: 'a@b.c',
			},
		})
	})

	it('should ignore empty and whitespace-only tokens and segments', async () => {
		const value = {
			id: '1',
			name: 'x',
		}

		const result = await run(interceptor, value, ' , id , ..,  ')
		expect(result).toEqual({
			id: '1',
		})

		// only empty tokens → pass-through
		const untouched = await run(interceptor, value, ' , ')
		expect(untouched).toEqual(value)
	})

	it('should return primitives unchanged when the trie goes deeper than the value', async () => {
		const value = {
			meta: 'just-a-string',
		}

		const result = await run(interceptor, value, 'meta.deep')
		expect(result).toEqual({
			meta: 'just-a-string',
		})
	})

	it('should return non-plain objects unchanged when the trie goes deeper', async () => {
		const value = {
			buffer: Buffer.from('x'),
			date: new Date('2024-01-01'),
			map: new Map(),
			pattern: /x/,
			set: new Set(),
		}

		const result = (await run(
			interceptor,
			value,
			'buffer.deep,date.deep,map.deep,set.deep,pattern.deep',
		)) as typeof value

		expect(result.date).toBeInstanceOf(Date)
		expect(result.buffer).toBeInstanceOf(Buffer)
		expect(result.map).toBeInstanceOf(Map)
		expect(result.set).toBeInstanceOf(Set)
		expect(result.pattern).toBeInstanceOf(RegExp)
	})
})
