import { Logger, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { ConfigService } from '@turystack/nestjs-config'
import { json } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Server } from '@/server.factory.js'

vi.mock('@nestjs/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@nestjs/core')>()
	return {
		...actual,
		NestFactory: {
			create: vi.fn(),
		},
	}
})

vi.mock('@nestjs/swagger', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@nestjs/swagger')>()
	return {
		...actual,
		SwaggerModule: {
			createDocument: vi.fn(() => ({
				components: {
					schemas: {
						AdminExtra: {
							type: 'object',
						},
					},
				},
				info: {},
				openapi: '3.0.0',
				paths: {
					'/api/v1/admin/users': {
						get: {
							operationId: 'listAdminUsers',
							responses: {},
						},
					},
					'/api/v1/billing': {
						get: {
							operationId: 'getBilling',
							responses: {},
						},
					},
				},
			})),
			setup: vi.fn(),
		},
	}
})

vi.mock('@scalar/nestjs-api-reference', () => ({
	apiReference: vi.fn(() => 'scalar-middleware'),
}))

vi.mock('express', () => ({
	json: vi.fn(() => 'json-middleware'),
}))

class AppModule {}

function createAppMock() {
	const http = {
		get: vi.fn(),
		set: vi.fn(),
		use: vi.fn(),
	}
	return {
		app: {
			enableCors: vi.fn(),
			enableVersioning: vi.fn(),
			get: vi.fn((_token?: unknown): unknown => new Map()),
			getHttpAdapter: () => ({
				getInstance: () => http,
			}),
			listen: vi.fn(),
			setGlobalPrefix: vi.fn(),
			use: vi.fn(),
			useGlobalFilters: vi.fn(),
			useGlobalInterceptors: vi.fn(),
			useGlobalPipes: vi.fn(),
		},
		http,
	}
}

function mockCreate(app: unknown) {
	vi.mocked(NestFactory.create).mockResolvedValue(
		app as Awaited<ReturnType<typeof NestFactory.create>>,
	)
}

describe('Server.create', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should bootstrap with cors, prefix, versioning, transforms, and health route', async () => {
		const { app, http } = createAppMock()
		mockCreate(app)

		const result = await Server.create(AppModule, {
			description: 'Test API description',
			port: 3200,
			title: 'Test API',
		})

		expect(NestFactory.create).toHaveBeenCalledWith(AppModule)
		expect(http.set).toHaveBeenCalledWith('trust proxy', 1)
		expect(app.enableCors).toHaveBeenCalled()
		expect(app.setGlobalPrefix).toHaveBeenCalledWith('api')
		expect(app.enableVersioning).toHaveBeenCalledWith({
			type: VersioningType.URI,
		})
		expect(app.useGlobalPipes).toHaveBeenCalledTimes(1)
		// built-in transforms: blacklist + fields
		expect(app.useGlobalInterceptors.mock.calls[0]).toHaveLength(2)
		expect(app.useGlobalFilters).toHaveBeenCalledTimes(1)
		expect(app.use).toHaveBeenCalledWith('json-middleware')
		expect(json).toHaveBeenCalled()
		expect(app.listen).toHaveBeenCalledWith(3200)
		expect(result).toBe(app)

		// health route responds with message + status
		const healthCall = http.get.mock.calls.find((call) => call[0] === '/health')
		expect(healthCall).toBeDefined()
		const send = vi.fn()
		const status = vi.fn(() => ({
			send,
		}))
		healthCall?.[1](
			{},
			{
				status,
			},
		)
		expect(status).toHaveBeenCalledWith(200)
		expect(send).toHaveBeenCalledWith({
			message: 'Test API is running',
			status: 'up',
		})

		// single openapi route when no projects
		const openapiCall = http.use.mock.calls.find(
			(call) => call[0] === '/api/openapi',
		)
		expect(openapiCall).toBeDefined()
		expect(apiReference).not.toHaveBeenCalled()
	})

	it('should resolve options from the typed config factory after bootstrap', async () => {
		const { app } = createAppMock()
		const config = {
			get: vi.fn((key: string) => {
				if (key === 'PORT') {
					return 4300
				}
				return undefined
			}),
		}
		app.get.mockImplementation((token?: unknown): unknown => {
			if (token === ConfigService) {
				return config
			}
			return new Map()
		})
		mockCreate(app)

		const factory = vi.fn((resolvedConfig: ConfigService) => ({
			description: 'Factory configuration',
			port: resolvedConfig.get('PORT') as number,
			title: 'Factory API',
		}))

		await Server.create(AppModule, factory)

		expect(factory).toHaveBeenCalledWith(config)
		expect(app.listen).toHaveBeenCalledWith(4300)
	})

	it('should prepend custom interceptors before the built-in transforms', async () => {
		const { app } = createAppMock()
		mockCreate(app)

		const custom = {
			intercept: vi.fn(),
		}
		await Server.create(AppModule, {
			description: 'Test',
			interceptors: [
				custom,
			],
			port: 3200,
			title: 'Test',
		})

		const registered = app.useGlobalInterceptors.mock.calls[0]
		expect(registered).toHaveLength(3)
		expect(registered[0]).toBe(custom)
	})

	it('should register scalar docs for the single-project setup', async () => {
		const { app, http } = createAppMock()
		mockCreate(app)

		await Server.create(AppModule, {
			description: 'Test',
			docs: {
				customCss: '.custom { color: red; }',
				favicon: '/favicon.svg',
				provider: 'scalar',
				theme: 'saturn',
			},
			globalPrefix: 'v2',
			healthMessage: 'all good',
			port: 4000,
			title: 'Docs API',
		})

		const referenceCall = http.use.mock.calls.find(
			(call) => call[0] === '/v2/reference',
		)
		expect(referenceCall?.[1]).toBe('scalar-middleware')
		expect(apiReference).toHaveBeenCalledWith(
			expect.objectContaining({
				favicon: '/favicon.svg',
				pageTitle: 'Docs API',
				theme: 'saturn',
				url: '/v2-json',
			}),
		)
	})

	it('should split the document per project with its own openapi and reference', async () => {
		const { app, http } = createAppMock()
		mockCreate(app)

		await Server.create(AppModule, {
			description: 'Test',
			docs: {
				favicon: '/favicon.svg',
				provider: 'scalar',
				theme: 'default',
			},
			port: 3200,
			projects: [
				{
					name: 'main',
					title: 'Main API',
				},
				{
					name: 'admin',
					prefix: 'admin',
					theme: 'moon',
					title: 'Admin API',
				},
			],
			title: 'Test API',
		})

		// each project gets its own openapi json route
		const mainOpenapi = http.use.mock.calls.find(
			(call) => call[0] === '/api/v1/openapi',
		)
		const adminOpenapi = http.use.mock.calls.find(
			(call) => call[0] === '/api/v1/admin/openapi',
		)
		expect(mainOpenapi).toBeDefined()
		expect(adminOpenapi).toBeDefined()

		// each project document only contains its own paths
		const sendDoc = (call: unknown[] | undefined) => {
			const send = vi.fn()
			const handler = call?.[1] as (req: object, res: object) => void
			handler(
				{},
				{
					status: () => ({
						send,
					}),
				},
			)
			return send.mock.calls[0][0] as {
				info: {
					title?: string
				}
				paths: Record<string, unknown>
			}
		}
		const adminDoc = sendDoc(adminOpenapi)
		expect(Object.keys(adminDoc.paths)).toEqual([
			'/api/v1/admin/users',
		])
		const mainDoc = sendDoc(mainOpenapi)
		expect(Object.keys(mainDoc.paths)).toEqual([
			'/api/v1/billing',
		])

		// each project gets its own scalar reference with its theme/title
		expect(apiReference).toHaveBeenCalledWith(
			expect.objectContaining({
				pageTitle: 'Admin API',
				theme: 'moon',
				url: '/api/v1/admin/openapi',
			}),
		)
		expect(apiReference).toHaveBeenCalledWith(
			expect.objectContaining({
				pageTitle: 'Main API',
				theme: 'default',
				url: '/api/v1/openapi',
			}),
		)
	})

	it('should capture the raw body via the json verify hook', async () => {
		const { app } = createAppMock()
		mockCreate(app)

		await Server.create(AppModule, {
			description: 'Test',
			port: 3200,
			title: 'Test',
		})

		const jsonOptions = vi.mocked(json).mock.calls[0]?.[0] as {
			verify: (req: object, res: object, rawBody: Buffer) => void
		}
		const request: {
			rawBody?: Buffer
		} = {}
		const rawBody = Buffer.from('payload')
		jsonOptions.verify(request, {}, rawBody)
		expect(request.rawBody).toBe(rawBody)
	})

	it('should collect @ApiExtraModels schemas per project prefix', async () => {
		const { app, http } = createAppMock()
		mockCreate(app)

		class AdminController {}
		Reflect.defineMetadata(
			'swagger/apiExtraModels',
			[
				{
					name: 'AdminExtra',
				},
			],
			AdminController,
		)
		Reflect.defineMetadata('path', 'admin/users', AdminController)

		class WithoutModels {}
		class WithoutPath {}
		Reflect.defineMetadata(
			'swagger/apiExtraModels',
			[
				{
					name: 'Orphan',
				},
			],
			WithoutPath,
		)

		const modulesContainer = new Map([
			[
				'm1',
				{
					controllers: new Map([
						[
							'c1',
							{
								metatype: AdminController,
							},
						],
						[
							'c2',
							{
								metatype: undefined,
							},
						],
						[
							'c3',
							{
								metatype: WithoutModels,
							},
						],
						[
							'c4',
							{
								metatype: WithoutPath,
							},
						],
					]),
				},
			],
		])
		app.get.mockReturnValue(modulesContainer)

		await Server.create(AppModule, {
			description: 'Test',
			port: 3200,
			projects: [
				{
					name: 'admin',
					prefix: 'admin',
					title: 'Admin API',
				},
			],
			title: 'Test API',
		})

		// the admin doc keeps the extra model even without direct $refs
		const adminOpenapi = http.use.mock.calls.find(
			(call) => call[0] === '/api/v1/admin/openapi',
		)
		const send = vi.fn()
		const adminHandler = adminOpenapi?.[1] as (req: object, res: object) => void
		adminHandler(
			{},
			{
				status: () => ({
					send,
				}),
			},
		)
		const doc = send.mock.calls[0][0] as {
			components?: {
				schemas?: Record<string, unknown>
			}
		}
		expect(doc.components?.schemas).toHaveProperty('AdminExtra')

		// no docs option → no scalar reference for projects either
		expect(apiReference).not.toHaveBeenCalled()
	})

	it('should suppress only duplicate-DTO logs while building the document', async () => {
		const { app } = createAppMock()
		mockCreate(app)

		const errorSpy = vi
			.spyOn(Logger, 'error')
			.mockImplementation(() => undefined)
		vi.mocked(SwaggerModule.createDocument).mockImplementationOnce(() => {
			Logger.error('Duplicate DTO detected: SomeDto')
			Logger.error('a real error')
			return {
				components: {},
				info: {},
				openapi: '3.0.0',
				paths: {},
			} as never
		})

		await Server.create(AppModule, {
			description: 'Test',
			port: 3200,
			title: 'Test',
		})

		expect(errorSpy).toHaveBeenCalledTimes(1)
		expect(errorSpy).toHaveBeenCalledWith('a real error')
		errorSpy.mockRestore()
	})
})
