# Requirements

## Functional Requirements

### FR1: Customer Data Import
- FR1.1: System shall accept CSV files (.csv)
- FR1.2: System shall accept Excel files (.xlsx, .xls)
- FR1.3: System shall validate required fields (name, email, phone)
- FR1.4: System shall detect and reject duplicate emails
- FR1.5: System shall report import results (success/failed counts)

### FR2: Customer Management
- FR2.1: System shall create customer records
- FR2.2: System shall read customer records with pagination
- FR2.3: System shall update customer information
- FR2.4: System shall delete customer records
- FR2.5: System shall search customers by name, email, or phone

### FR3: Contact History
- FR3.1: System shall record contact events
- FR3.2: System shall display last 3 contact dates
- FR3.3: System shall display total contact count
- FR3.4: System shall support contact types: email, phone, other

### FR4: Cold Email
- FR4.1: System shall send emails via SMTP
- FR4.2: System shall support bulk email sending
- FR4.3: System shall automatically log email contacts
- FR4.4: System shall report send results (success/failed)

## Non-Functional Requirements

### NFR1: Performance
- NFR1.1: Import 1000 records in under 10 seconds
- NFR1.2: Page load under 2 seconds

### NFR2: Usability
- NFR2.1: Desktop app for Windows and macOS
- NFR2.2: Simple, intuitive UI

### NFR3: Security
- NFR3.1: No hardcoded credentials
- NFR3.2: Environment-based configuration
