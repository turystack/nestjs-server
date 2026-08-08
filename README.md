# @turystack/nestjs-server

NestJS bootstrap factory with Swagger/OpenAPI, Scalar reference, Zod validation, and response transforms.

## Installation

```bash
pnpm add @turystack/nestjs-server
```

### Peer dependencies

The host application provides these:

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/swagger @scalar/nestjs-api-reference @turystack/nestjs-config express nestjs-zod reflect-metadata rxjs zod
```

Optional — install only the ones whose feature you use:

```bash
pnpm add @turystack/nestjs-context
```

## Documentation

Options, API reference and examples:

**https://tury.dev/libs/nestjs-server**

## Development

```bash
pnpm install
pnpm typecheck
pnpm check
pnpm test
pnpm build
```
