# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL database

## Setup

### 1. Clone and Install

```bash
git clone <repository>
cd ppop_DBmanager
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:
```
APP_ENV=dev
DATABASE_URL=postgresql://user:pass@localhost:5432/ppop
JWT_SECRET=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
API_PORT=3001
API_URL=http://localhost:3001
```

### 3. Database Setup

```bash
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
```

## Development

### Run All Apps

```bash
pnpm dev
```

### Run Individual Apps

```bash
pnpm dev:api      # API server on :3001
pnpm dev:desktop  # Desktop app
pnpm dev:landing  # Landing page on :3000
```

## Build

### Build All

```bash
pnpm build
```

### Build Desktop (Windows)

```bash
pnpm --filter @ppop/desktop build:win
```

### Build Desktop (macOS)

```bash
pnpm --filter @ppop/desktop build:mac
```

## Release

### Version Bump and Push

```bash
pnpm version:patch  # 0.0.1 -> 0.0.2
```

This will:
1. Bump version in package.json
2. Commit the change
3. Create a git tag
4. Push to origin
5. Trigger GitHub Actions

## Clean

```bash
pnpm clean  # Remove all build artifacts
```

## Project Commands (from root)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run all tests |
| `pnpm clean` | Clean build artifacts |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run DB migrations |
| `pnpm version:patch` | Bump patch version and release |

## Code Style

- TypeScript strict mode
- ESLint for linting
- File size limit: ~2000 characters
- One responsibility per file
- English for code, comments may be Korean
