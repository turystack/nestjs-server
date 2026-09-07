import 'reflect-metadata'

import { Body } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Controller } from '@/decorators/controller.decorator.js'
import { Route } from '@/decorators/route.decorator.js'

describe('Route custom method (e2e)', () => {
	it('matches the colon URL through Nest + Express and rejects the slash form', async () => {
		@Controller({
			path: 'invoices',
			tag: 'Invoices',
		})
		class InvoicesController {
			@Route({
				description: 'Pays an invoice.',
				method: 'POST',
				path: ':invoiceId::pay',
				summary: 'Pay Invoice',
			})
			async pay() {}
		}

		const moduleRef = await Test.createTestingModule({
			controllers: [
				InvoicesController,
			],
		}).compile()

		const app = moduleRef.createNestApplication()
		await app.init()
		await app.listen(0)
		const url = await app.getUrl()

		const matched = await fetch(`${url}/invoices/inv-123:pay`, {
			method: 'POST',
		})
		expect(matched.status).toBe(204)

		const slashForm = await fetch(`${url}/invoices/inv-123/pay`, {
			method: 'POST',
		})
		expect(slashForm.status).toBe(404)

		await app.close()
	})
})

/**
 * `parameters.body` used to reach the OpenAPI document and nothing else.
 *
 * The schema was published, the handler was handed whatever arrived, and a
 * missing required field showed up as `undefined` somewhere deeper — a 401 from
 * an authorization check, in the case that made this obvious, on a request that
 * had already written a row. `ARC-DEL-1` says the boundary validates shape.
 */
describe('Route body validation (e2e)', () => {
	const body = z.object({
		email: z.email(),
		tx: z.string().min(1),
	})

	async function start() {
		const seen: unknown[] = []

		@Controller({
			path: 'sessions',
			tag: 'Sessions',
		})
		class SessionsController {
			@Route({
				description: 'Starts a session.',
				method: 'POST',
				parameters: {
					body,
				},
				path: '',
				responses: {
					200: z.object({
						ok: z.boolean(),
					}),
				},
				summary: 'Start',
			})
			async start(@Body() input: z.infer<typeof body>) {
				seen.push(input)

				return {
					ok: true,
				}
			}
		}

		const moduleRef = await Test.createTestingModule({
			controllers: [
				SessionsController,
			],
		}).compile()

		const app = moduleRef.createNestApplication()
		await app.init()
		await app.listen(0)

		return {
			app,
			seen,
			url: await app.getUrl(),
		}
	}

	it('rejects a body missing a required field, and the handler never runs', async () => {
		const { app, seen, url } = await start()

		const response = await fetch(`${url}/sessions`, {
			body: JSON.stringify({
				email: 'someone@example.com',
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		})

		expect(response.status).toBe(400)
		expect(seen).toEqual([])

		await app.close()
	})

	it('passes a valid body through to the handler', async () => {
		const { app, seen, url } = await start()

		const response = await fetch(`${url}/sessions`, {
			body: JSON.stringify({
				email: 'someone@example.com',
				tx: 'abc',
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		})

		expect(response.status).toBe(200)
		expect(seen).toEqual([
			{
				email: 'someone@example.com',
				tx: 'abc',
			},
		])

		await app.close()
	})
})
