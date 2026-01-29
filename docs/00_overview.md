# PPOP DB Manager - Overview

## Project Summary

Customer contact management desktop application with cold email functionality.

## Core Features

1. **Customer Data Import**
   - CSV/Excel file upload
   - Automatic validation
   - Duplicate detection

2. **Customer Management**
   - CRUD operations
   - Search and filter
   - Pagination

3. **Contact History Tracking**
   - Last 3 contact dates
   - Total contact count
   - Contact type (email/phone/other)

4. **Cold Email**
   - SMTP integration (Nodemailer)
   - Bulk email sending
   - Automatic contact logging

## Architecture

```
[Desktop App (Electron)]  ──HTTP──>  [API Server]  ──SQL──>  [PostgreSQL]
       │
       └── Nodemailer (SMTP) ──> Email
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Desktop | Electron + React + TypeScript |
| API | Express + TypeScript |
| Database | PostgreSQL + Prisma |
| Email | Nodemailer |
| Landing | Next.js |
| Package Manager | pnpm (monorepo) |

## Project Structure

```
├── apps/
│   ├── api/          # Backend API server
│   ├── desktop/      # Electron desktop app
│   └── landing/      # Next.js landing page
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared configuration
│   └── utils/        # Shared utilities
├── database/         # DB assets
└── docs/             # Documentation
```
