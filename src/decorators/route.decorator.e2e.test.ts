import 'reflect-metadata'

import { Test } from '@nestjs/testing'
import { describe, expect, it } from 'vitest'

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
