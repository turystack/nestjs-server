import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { firstValueFrom, of } from 'rxjs'
import { describe, expect, it } from 'vitest'

import { ResponseBlacklistTransform } from './response-blacklist.transform.js'

function run(interceptor: ResponseBlacklistTransform, value: unknown) {
	const handler: CallHandler = {
		handle: () => of(value),
	}
	const ctx = {} as ExecutionContext
	return firstValueFrom(interceptor.intercept(ctx, handler))
}

describe('ResponseBlacklistTransform', () => {
	const interceptor = new ResponseBlacklistTransform()

	it('strips blacklisted keys from flat object', async () => {
		const result = await run(interceptor, {
			id: '1',
			name: 'João',
			password: 'secret',
			passwordHash: 'hash',
		})

		expect(result).toEqual({
			id: '1',
			name: 'João',
		})
	})

	it('strips blacklisted keys recursively from nested object', async () => {
		const result = await run(interceptor, {
			user: {
				id: '1',
				password: 'secret',
				profile: {
					name: 'João',
					otpHash: 'x',
				},
			},
		})

		expect(result).toEqual({
			user: {
				id: '1',
				profile: {
					name: 'João',
				},
			},
		})
	})

	it('strips blacklisted keys from arrays of objects', async () => {
		const result = await run(interceptor, [
			{
				id: '1',
				password: 'a',
			},
			{
				id: '2',
				password: 'b',
			},
		])

		expect(result).toEqual([
			{
				id: '1',
			},
			{
				id: '2',
			},
		])
	})

	it('strips blacklisted keys from nested arrays', async () => {
		const result = await run(interceptor, {
			data: [
				{
					children: [
						{
							id: '11',
							secret: 's',
						},
					],
					id: '1',
					token: 'x',
				},
			],
		})

		expect(result).toEqual({
			data: [
				{
					children: [
						{
							id: '11',
						},
					],
					id: '1',
				},
			],
		})
	})

	it('preserves Date instances', async () => {
		const date = new Date('2026-04-11T00:00:00.000Z')
		const result = await run(interceptor, {
			createdAt: date,
			id: '1',
		})

		expect(result).toEqual({
			createdAt: date,
			id: '1',
		})
	})

	it('passes primitives and null through', async () => {
		await expect(run(interceptor, null)).resolves.toBe(null)
		await expect(run(interceptor, 'hello')).resolves.toBe('hello')
		await expect(run(interceptor, 42)).resolves.toBe(42)
	})

	it('does not mutate the input object', async () => {
		const input = {
			id: '1',
			password: 'secret',
		}
		await run(interceptor, input)

		expect(input).toEqual({
			id: '1',
			password: 'secret',
		})
	})

	it('strips blacklisted keys from class instances (e.g. @Entity() objects)', async () => {
		class User {
			id!: string
			name!: string
			password!: string
		}
		const user = Object.assign(new User(), {
			id: '1',
			name: 'João',
			password: 'secret',
		})

		const result = await run(interceptor, user)
		expect(result).toEqual({
			id: '1',
			name: 'João',
		})
	})

	it('is noop when no blacklisted keys are present', async () => {
		const result = await run(interceptor, {
			id: '1',
			name: 'João',
		})

		expect(result).toEqual({
			id: '1',
			name: 'João',
		})
	})

	it('should leave non-plain objects (Buffer, Map, Set, RegExp) untouched', async () => {
		const value = {
			buffer: Buffer.from('abc'),
			map: new Map([
				[
					'k',
					'v',
				],
			]),
			pattern: /abc/,
			set: new Set([
				1,
			]),
		}

		const result = (await run(interceptor, value)) as typeof value

		expect(result.buffer).toBeInstanceOf(Buffer)
		expect(result.map).toBeInstanceOf(Map)
		expect(result.set).toBeInstanceOf(Set)
		expect(result.pattern).toBeInstanceOf(RegExp)
	})
})
