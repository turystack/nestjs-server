import type { NextFunction, Request, Response } from 'express'

/** Header carrying an inbound correlation id. */
export const CORRELATION_ID_HEADER = 'x-correlation-id'

type Middleware = (
	request: Request,
	response: Response,
	next: NextFunction,
) => void

/**
 * Opens the request context, so everything downstream — use-cases, published
 * events, logs — shares one correlation id without any of them being handed it.
 *
 * An inbound id is honoured, so a chain that started in another service or in
 * the browser keeps its identity; otherwise one is generated here, at the point
 * where the operation begins.
 *
 * Returns `undefined` when `@turystack/nestjs-context` is not installed: the
 * package is an optional peer and the server works without it.
 */
export async function createCorrelationMiddleware(
	header: string = CORRELATION_ID_HEADER,
): Promise<Middleware | undefined> {
	try {
		const { getCurrentContext, runWithContext } = await import(
			'@turystack/nestjs-context'
		)

		return (request, response, next) => {
			const inbound = request.headers[header]
			const correlationId = Array.isArray(inbound) ? inbound[0] : inbound

			runWithContext(
				{
					correlationId,
				},
				() => {
					const resolved = getCurrentContext()?.correlationId

					// Echoed back so the caller can correlate from the outside too.
					if (resolved) {
						response.setHeader(header, resolved)
					}

					next()
				},
			)
		}
	} catch {
		return undefined
	}
}
