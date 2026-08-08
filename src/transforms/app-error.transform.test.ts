import type { ArgumentsHost } from '@nestjs/common'
import { HttpException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'

import { AppErrorTransform } from '@/transforms/app-error.transform.js'

class FakeAppError extends Error {
	readonly statusCode: number
	readonly code: string
	readonly metadata?: Record<string, unknown>

	constructor(
		message: string,
		statusCode: number,
		code: string,
		metadata?: Record<string, unknown>,
	) {
		super(message)
		this.statusCode = statusCode
		this.code = code
		this.metadata = metadata
	}
}

const createHost = (headersSent = false) => {
	const response = {
		headersSent,
		json: vi.fn(),
		status: vi.fn(),
	}
	response.status.mockReturnValue(response)

	const host = {
		switchToHttp: () => ({
			getResponse: () => response,
		}),
	} as unknown as ArgumentsHost

	return {
		host,
		response,
	}
}

describe('AppErrorTransform', () => {
	it('maps an AppError-shaped exception to { statusCode, code, message, ...metadata }', () => {
		const { host, response } = createHost()

		new AppErrorTransform().catch(
			new FakeAppError('order.not_found', 404, 'order.not_found', {
				resourceId: 'ord-1',
			}),
			host,
		)

		expect(response.status).toHaveBeenCalledWith(404)
		expect(response.json).toHaveBeenCalledWith({
			code: 'order.not_found',
			message: 'order.not_found',
			resourceId: 'ord-1',
			statusCode: 404,
		})
	})

	it('does not let metadata override code/message/status', () => {
		const { host, response } = createHost()

		new AppErrorTransform().catch(
			new FakeAppError('order.not_found', 404, 'order.not_found', {
				code: 'spoofed',
				message: 'spoofed',
			}),
			host,
		)

		expect(response.json).toHaveBeenCalledWith({
			code: 'order.not_found',
			message: 'order.not_found',
			statusCode: 404,
		})
	})

	it('passes HttpException bodies through unchanged', () => {
		const { host, response } = createHost()

		new AppErrorTransform().catch(
			new HttpException(
				{
					message: 'Unauthorized.',
					statusCode: 401,
				},
				401,
			),
			host,
		)

		expect(response.status).toHaveBeenCalledWith(401)
		expect(response.json).toHaveBeenCalledWith({
			message: 'Unauthorized.',
			statusCode: 401,
		})
	})

	it('wraps a string HttpException response into an object body', () => {
		const { host, response } = createHost()

		new AppErrorTransform().catch(new HttpException('Forbidden', 403), host)

		expect(response.json).toHaveBeenCalledWith({
			message: 'Forbidden',
			statusCode: 403,
		})
	})

	it('returns a plain 500 for unknown errors', () => {
		const { host, response } = createHost()

		new AppErrorTransform().catch(new Error('boom'), host)

		expect(response.status).toHaveBeenCalledWith(500)
		expect(response.json).toHaveBeenCalledWith({
			message: 'Internal Server Error',
			statusCode: 500,
		})
	})

	it('does nothing when headers were already sent', () => {
		const { host, response } = createHost(true)

		new AppErrorTransform().catch(new Error('boom'), host)

		expect(response.status).not.toHaveBeenCalled()
		expect(response.json).not.toHaveBeenCalled()
	})
})
