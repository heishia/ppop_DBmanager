# API Documentation

Base URL: `http://localhost:3001/api`

## Customers

### GET /customers
Get paginated customer list.

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "010-1234-5678",
        "totalContacts": 5,
        "recentContacts": [...]
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### GET /customers/:id
Get single customer with contact history.

### POST /customers
Create new customer.

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "010-1234-5678"
}
```

### PATCH /customers/:id
Update customer.

### DELETE /customers/:id
Delete customer.

### GET /customers/search?q=query
Search customers.

---

## Contacts

### GET /contacts/customer/:customerId
Get contact history for customer.

### POST /contacts
Create contact record.

**Body**:
```json
{
  "customerId": "clx...",
  "type": "email",
  "note": "Subject: Hello"
}
```

### DELETE /contacts/:id
Delete contact record.

---

## Email

### GET /email/verify
Check SMTP configuration.

### POST /email/send
Send single email.

**Body**:
```json
{
  "to": "john@example.com",
  "subject": "Hello",
  "body": "<p>Hi John</p>"
}
```

### POST /email/bulk
Send bulk emails.

**Body**:
```json
{
  "customerIds": ["clx...", "clx..."],
  "subject": "Hello",
  "body": "<p>Hi there</p>"
}
```

---

## Import

### POST /import/file
Import customers from file.

**Body**: `multipart/form-data` with `file` field

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {"row": 3, "field": "email", "message": "Invalid format"}
    ]
  }
}
```

### GET /import/template
Get import template info.
