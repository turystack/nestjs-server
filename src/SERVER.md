# Server

HTTP server factory, request decorators, and Zod validation transforms.

## Server factory

```ts
import { Server } from 'aw-backend/server'
import { AppModule } from './app.module'

Server.create(AppModule, {
  port: 3200,
  title: 'My API',
  description: 'My API description',
  docs: {
    pageTitle: 'My API',
    title: 'My API',
    favicon: 'https://example.com/favicon.ico',
  },
})
```

`Server.create` configures:

- Global prefix (`/api` by default)
- URI versioning
- Zod validation global pipe
- Raw body capture (for webhook signature verification)
- Swagger/OpenAPI documentation
- Health check at `/health`
- OpenAPI JSON at `/<prefix>/openapi`
- API reference UI at `/<prefix>/reference` (when `docs` is provided)

### ServerOptions

| Property | Type | Default | Description |
|---|---|---|---|
| `port` | `number` | — | Server port |
| `title` | `string` | — | API title (Swagger + health) |
| `description` | `string` | — | API description (Swagger) |
| `version` | `string` | `'1.0'` | API version |
| `globalPrefix` | `string` | `'api'` | Global route prefix |
| `healthMessage` | `string` | `${title} is running` | Health endpoint response |
| `docs` | `DocsReferenceOptions` | — | API reference UI config |

### DocsReferenceOptions

| Property | Type | Default | Description |
|---|---|---|---|
| `pageTitle` | `string` | — | Browser tab title |
| `title` | `string` | — | Reference page title |
| `favicon` | `string` | — | Favicon URL |
| `theme` | `string` | `'moon'` | UI theme |
| `customCss` | `string` | built-in | Custom CSS overrides |

## Decorators

### `@Controller(options)`

Class decorator wrapping NestJS `@Controller` with Swagger tag and optional schema registration.

```ts
import { Controller } from 'aw-backend/server'

@Controller({
  prefix: 'users',
  tag: 'Users',
  schemas: {
    UserResponse: { schema: UserResponseSchema },
  },
})
class UsersController {}
```

### `@Route(options)`

Method decorator combining HTTP method, Swagger docs, and validation in one.

```ts
import { Route } from 'aw-backend/server'

@Route({
  method: 'POST',
  path: ':id/activate',
  summary: 'Activate User',
  description: 'Activates a user by ID',
  parameters: {
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ reason: z.string() }),
  },
  responses: {
    200: UserResponseSchema,
    404: [{ description: 'User not found' }],
  },
})
async activateUser() {}
```

#### RouteOptions

| Property | Type | Description |
|---|---|---|
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'PATCH' \| 'DELETE'` | HTTP method |
| `path` | `string` | Route path |
| `summary` | `string` | Swagger summary |
| `description` | `string` | Swagger description |
| `version` | `number` | API version (default: `1`) |
| `parameters` | `RouteParameters` | Request params/query/body/headers schemas |
| `responses` | `RouteResponses` | Response schemas (200, 201, 204, 404, 409) |

### `@Request(schema?)`

Parameter decorator that parses and validates the request using Zod schemas.

```ts
import { Request, createRequestSchema, type RequestInput } from 'aw-backend/server'

const schema = createRequestSchema({
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ include: z.string().optional() }),
  body: z.object({ name: z.string() }),
  headers: z.object({ 'x-api-key': z.string() }),
})

async handler(@Request(schema) req: RequestInput<typeof schema>) {
  req.params.id     // string (validated)
  req.query.include  // string | undefined (validated)
  req.body.name      // string (validated)
  req.headers['x-api-key'] // string (validated)
  req.rawBody        // Buffer
}
```

## Zod transforms

### `ZodValidationTransform`

Global validation pipe (auto-configured by `Server.create`).

### `createZodValidationException(error)`

Creates a `BadRequestException` with formatted Zod errors:

```json
{
  "statusCode": 400,
  "message": "Bad Request Error",
  "errors": [
    { "code": "invalid_type", "message": "Required", "path": "name" }
  ]
}
```

## Utilities

| Function | Description |
|---|---|
| `toJsonSchema(schema)` | Convert Zod schema to cleaned JSON Schema |
| `createOpenApiDocument(document)` | Clean and normalize OpenAPI document |
| `cleanSchema(schema)` | Remove unnecessary OpenAPI properties |
