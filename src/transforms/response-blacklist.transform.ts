import type {
	CallHandler,
	ExecutionContext,
	NestInterceptor,
} from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * Keys stripped from every HTTP response, at any depth.
 *
 * Security-critical: this list is the last line of defense against
 * accidental leaks from entities, repositories, or ad-hoc controller responses.
 */
export const RESPONSE_BLACKLIST_FIELDS: readonly string[] = [
	'password',
	'passwordHash',
	'otpHash',
	'refreshTokenHash',
	'token',
	'secret',
	'apiKey',
]

const BLACKLIST_SET = new Set<string>(RESPONSE_BLACKLIST_FIELDS)

function isWalkableObject(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== 'object') {
		return false
	}
	if (Array.isArray(value)) {
		return false
	}
	if (value instanceof Date) {
		return false
	}
	if (value instanceof Buffer) {
		return false
	}
	if (value instanceof Map) {
		return false
	}
	if (value instanceof Set) {
		return false
	}
	if (value instanceof RegExp) {
		return false
	}
	return true
}

function stripBlacklist(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(stripBlacklist)
	}

	if (isWalkableObject(value)) {
		const output: Record<string, unknown> = {}
		for (const key of Object.keys(value)) {
			if (BLACKLIST_SET.has(key)) {
				continue
			}
			output[key] = stripBlacklist(value[key])
		}
		return output
	}

	return value
}

/**
 * Global response interceptor that removes {@link RESPONSE_BLACKLIST_FIELDS}
 * from every response payload, recursing through nested objects and arrays.
 *
 * Runs BEFORE {@link ResponseFieldsTransform} so projection can never
 * reintroduce a blacklisted field.
 *
 * Does not mutate the original value; always returns a new object tree.
 * Leaves `Date`, `Buffer`, and non-plain objects untouched.
 */
@Injectable()
export class ResponseBlacklistTransform implements NestInterceptor {
	intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(map((data) => stripBlacklist(data)))
	}
}
