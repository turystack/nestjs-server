import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpException, Logger } from '@nestjs/common'
import type { Response } from 'express'

type AppErrorShape = Error & {
	statusCode: number
	code: string
	metadata?: Record<string, unknown>
}

const isAppError = (exception: unknown): exception is AppErrorShape =>
	exception instanceof Error &&
	typeof (exception as AppErrorShape).statusCode === 'number' &&
	typeof (exception as AppErrorShape).code === 'string'

/**
 * Global exception filter that maps errors to the documented body shape
 * `{ statusCode, code, message, ...metadata }` — no message translation:
 * the code IS the contract (typed app-side via `InferExceptionCodes`).
 *
 * - `AppError` from `@turystack/exceptions` (duck-typed, so any copy of the
 *   package matches): status/code/metadata come from the error itself.
 * - `HttpException`: passes through with Nest's own body.
 * - Anything else: logged and returned as a plain 500.
 */
@Catch()
export class AppErrorTransform implements ExceptionFilter {
	private readonly _logger = new Logger('Exceptions')

	catch(exception: unknown, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>()

		if (response.headersSent) {
			return
		}

		if (isAppError(exception)) {
			response.status(exception.statusCode).json({
				statusCode: exception.statusCode,
				...exception.metadata,
				code: exception.code,
				message: exception.message,
			})
			return
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus()
			const raw = exception.getResponse()
			const body =
				typeof raw === 'string'
					? {
							message: raw,
							statusCode: status,
						}
					: raw

			response.status(status).json(body)
			return
		}

		this._logger.error(exception)
		response.status(500).json({
			message: 'Internal Server Error',
			statusCode: 500,
		})
	}
}
