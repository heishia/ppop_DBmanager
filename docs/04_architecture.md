# Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Desktop App (Electron)                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 React Frontend                       │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │
│  │  │Customer │ │ Detail  │ │ Import  │ │ Email   │   │    │
│  │  │  List   │ │  Page   │ │  Page   │ │  Page   │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                      HTTP (axios)                            │
└─────────────────────────────│────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Server (Express)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                     Routes                           │    │
│  │  /customers  /contacts  /email  /import              │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Services                          │    │
│  │  CustomerService  ContactService  EmailService       │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌──────────────┐  ┌───────────────┐                        │
│  │ Prisma ORM   │  │  Nodemailer   │                        │
│  └──────────────┘  └───────────────┘                        │
└─────────│────────────────────│───────────────────────────────┘
          │                    │
          ▼                    ▼
   ┌──────────────┐     ┌──────────────┐
   │  PostgreSQL  │     │  SMTP Server │
   └──────────────┘     └──────────────┘
```

## Directory Structure

```
apps/
├── api/
│   ├── prisma/           # Prisma schema
│   └── src/
│       ├── lib/          # Prisma client, email
│       ├── middleware/   # Error handling
│       ├── routes/       # API routes
│       └── services/     # Business logic
│
├── desktop/
│   ├── electron/         # Electron main/preload
│   └── src/
│       ├── components/   # React components
│       ├── lib/          # API client
│       ├── pages/        # Page components
│       └── styles/       # CSS
│
└── landing/
    └── src/app/          # Next.js App Router
```

## Data Flow

1. **Import Flow**
   - User selects file in Electron
   - Electron reads file to base64
   - React sends to API
   - API parses and creates records

2. **Email Flow**
   - User selects recipients and composes email
   - React sends to API
   - API sends via Nodemailer
   - API creates contact history records
