# PPOP DB Manager

Customer contact management desktop application with cold email functionality.

## Overview

- Import customer data from CSV/Excel files
- Manage customer information (name, phone, email)
- Track contact history (last 3 contacts, total count)
- Send cold emails via SMTP

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate
```

### Development

```bash
# Run all apps
pnpm dev

# Run specific app
pnpm dev:api      # API server
pnpm dev:desktop  # Desktop app
pnpm dev:landing  # Landing page
```

### Build

```bash
# Build all
pnpm build

# Build specific
pnpm build:desktop  # Creates .exe and .dmg
```

### Release

```bash
# Patch version (0.0.1 -> 0.0.2)
pnpm version:patch
```

## Architecture

```
[Desktop App] ──HTTP──> [API Server] ──SQL──> [PostgreSQL]
      │
      └── SMTP ──> Email
```

## Documentation

- [Overview](./docs/00_overview.md)
- [Requirements](./docs/01_requirements.md)
- [Domain](./docs/02_domain.md)
- [Use Cases](./docs/03_usecases.md)
- [Architecture](./docs/04_architecture.md)
- [API](./docs/05_api.md)
- [Dev Guide](./docs/06_dev_guide.md)

## Project Structure

```
├── apps/
│   ├── api/          # Node.js API server
│   ├── desktop/      # Electron desktop app
│   └── landing/      # Next.js landing page
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared configuration
│   └── utils/        # Shared utilities
├── database/         # DB migrations and seeds
└── docs/             # Documentation
```
