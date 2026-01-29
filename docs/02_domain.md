# Domain Model

## Entities

### Customer
Primary entity representing a customer contact.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (CUID) |
| name | string | Customer name |
| email | string | Email address (unique) |
| phone | string | Phone number |
| createdAt | DateTime | Record creation time |
| updatedAt | DateTime | Last update time |

### ContactHistory
Records each contact interaction with a customer.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (CUID) |
| customerId | string | Reference to Customer |
| contactedAt | DateTime | Contact timestamp |
| type | ContactType | Type of contact |
| note | string? | Optional note |

### ContactType (Enum)
- `email` - Email contact
- `phone` - Phone call
- `other` - Other contact type

## Aggregates

### CustomerWithContacts
Customer entity with contact summary.

| Field | Type | Description |
|-------|------|-------------|
| ...Customer | - | All Customer fields |
| totalContacts | number | Total contact count |
| recentContacts | ContactHistory[] | Last 3 contacts |

## Domain Rules

1. Email must be unique across all customers
2. Email format must be valid
3. Phone format must contain only digits, spaces, hyphens, and parentheses
4. Contact history is automatically created when email is sent
