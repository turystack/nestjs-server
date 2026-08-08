import type {
	CallHandler,
	ExecutionContext,
	NestInterceptor,
} from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type { Request } from 'express'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

type FieldsTrie = {
	[key: string]: FieldsTrie | true
}

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

/**
 * Parses `fields=id,name,user.email,trips.route.id` into a nested trie.
 *
 * Each leaf holds `true`; nested objects describe child projections.
 * Empty/whitespace tokens are ignored.
 */
function parseFieldsQuery(raw: string): FieldsTrie | null {
	const trie: FieldsTrie = {}
	let hasAny = false

	for (const token of raw.split(',')) {
		const path = token.trim()
		if (!path) {
			continue
		}

		const segments = path
			.split('.')
			.map((s) => s.trim())
			.filter(Boolean)
		if (segments.length === 0) {
			continue
		}

		let cursor: FieldsTrie = trie
		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i] as string
			const isLast = i === segments.length - 1

			if (isLast) {
				// Don't overwrite an existing deeper spec with a leaf —
				// e.g. "user,user.email" should keep the deeper projection.
				if (cursor[segment] === undefined) {
					cursor[segment] = true
				}
				continue
			}

			const existing = cursor[segment]
			if (existing === undefined || existing === true) {
				const next: FieldsTrie = {}
				cursor[segment] = next
				cursor = next
			} else {
				cursor = existing
			}
		}

		hasAny = true
	}

	return hasAny ? trie : null
}

function pickFields(value: unknown, trie: FieldsTrie | true): unknown {
	if (trie === true) {
		return value
	}

	if (Array.isArray(value)) {
		return value.map((item) => pickFields(item, trie))
	}

	if (!isWalkableObject(value)) {
		return value
	}

	const output: Record<string, unknown> = {}
	for (const key of Object.keys(trie)) {
		if (!(key in value)) {
			continue
		}
		output[key] = pickFields(value[key], trie[key] as FieldsTrie | true)
	}
	return output
}

/**
 * Projects the response payload down to the subset of fields requested via
 * `?fields=` query string. Supports dot notation for nested objects and
 * recurses through arrays automatically.
 *
 * Syntax:
 * - `fields=id,name` — flat projection
 * - `fields=id,user.email,trips.route.id` — nested via dot notation
 *
 * Behavior:
 * - Missing/empty `fields` → pass-through untouched.
 * - Unknown field names → silently dropped (forgiving for client evolution).
 * - Auto-unwraps paginated envelopes of shape `{ data, meta }`: projection
 *   applies to `data`, `meta` is preserved verbatim.
 * - Runs AFTER {@link ResponseBlacklistTransform} so blacklisted keys are
 *   already gone and can never be reintroduced via `fields=`.
 */
@Injectable()
export class ResponseFieldsTransform implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request>()
		const raw = request?.query?.fields

		const rawString = Array.isArray(raw)
			? raw.join(',')
			: typeof raw === 'string'
				? raw
				: ''
		const trie = rawString ? parseFieldsQuery(rawString) : null

		if (!trie) {
			return next.handle()
		}

		return next.handle().pipe(
			map((data) => {
				if (
					isWalkableObject(data) &&
					'data' in data &&
					'meta' in data &&
					(Array.isArray(data.data) || isWalkableObject(data.data))
				) {
					return {
						...data,
						data: pickFields(data.data, trie),
					}
				}
				return pickFields(data, trie)
			}),
		)
	}
}
