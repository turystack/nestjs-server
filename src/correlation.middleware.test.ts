import { getCurrentContext } from '@turystack/nestjs-context'
import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
	CORRELATION_ID_HEADER,
	createCorrelationMiddleware,
} from '@/correlation.middleware.js'

function createRequest(headers: Record<string, unknown> = {}): Request {
	return {
		headers,
	} as unknown as Request
}

function createResponse() {
	const headers = new Map<string, string>()

	return {
		headers,
		setHeader: vi.fn((name: string, value: string) => {
			headers.set(name, value)
		}),
	} as unknown as Response & {
		headers: Map<string, string>
		setHeader: ReturnType<typeof vi.fn>
	}
}

describe('createCorrelationMiddleware', () => {
	let middleware: NonNullable<
		Awaited<ReturnType<typeof createCorrelationMiddleware>>
	>

	beforeEach(async () => {
		const resolved = await createCorrelationMiddleware()

		if (!resolved) {
			throw new Error('context package should be installed in this workspace')
		}

		middleware = resolved
	})

	it('opens a scope so downstream code sees a correlation id', () => {
		let seen: string | undefined

		middleware(createRequest(), createResponse(), (() => {
			seen = getCurrentContext()?.correlationId
		}) as NextFunction)

		expect(seen).toMatch(/[0-9a-f-]{36}/)
	})

	it('honours an inbound id so a chain started upstream keeps its identity', () => {
		let seen: string | undefined

		middleware(
			createRequest({
				[CORRELATION_ID_HEADER]: 'from-the-caller',
			}),
			createResponse(),
			(() => {
				seen = getCurrentContext()?.correlationId
			}) as NextFunction,
		)

		expect(seen).toBe('from-the-caller')
	})

	it('takes the first value when the header arrives repeated', () => {
		let seen: string | undefined

		middleware(
			createRequest({
				[CORRELATION_ID_HEADER]: [
					'first',
					'second',
				],
			}),
			createResponse(),
			(() => {
				seen = getCurrentContext()?.correlationId
			}) as NextFunction,
		)

		expect(seen).toBe('first')
	})

	it('echoes the id back so the caller can correlate from outside', () => {
		const response = createResponse()

		middleware(
			createRequest({
				[CORRELATION_ID_HEADER]: 'req-1',
			}),
			response,
			(() => undefined) as NextFunction,
		)

		expect(response.setHeader).toHaveBeenCalledWith(
			CORRELATION_ID_HEADER,
			'req-1',
		)
	})

	it('echoes the generated id when the caller sent none', () => {
		const response = createResponse()

		middleware(createRequest(), response, (() => undefined) as NextFunction)

		expect(response.headers.get(CORRELATION_ID_HEADER)).toMatch(/[0-9a-f-]{36}/)
	})

	it('closes the scope once the request is done', () => {
		middleware(
			createRequest(),
			createResponse(),
			(() => undefined) as NextFunction,
		)

		expect(getCurrentContext()).toBeUndefined()
	})

	it('keeps concurrent requests isolated', async () => {
		const seen: string[] = []

		await Promise.all([
			new Promise<void>((resolve) => {
				middleware(
					createRequest({
						[CORRELATION_ID_HEADER]: 'a',
					}),
					createResponse(),
					(async () => {
						await new Promise((tick) => setTimeout(tick, 10))
						seen.push(getCurrentContext()?.correlationId ?? 'lost')
						resolve()
					}) as NextFunction,
				)
			}),
			new Promise<void>((resolve) => {
				middleware(
					createRequest({
						[CORRELATION_ID_HEADER]: 'b',
					}),
					createResponse(),
					(() => {
						seen.push(getCurrentContext()?.correlationId ?? 'lost')
						resolve()
					}) as NextFunction,
				)
			}),
		])

		expect(seen.sort()).toEqual([
			'a',
			'b',
		])
	})
})
