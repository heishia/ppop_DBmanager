# Use Cases

## UC1: Import Customers from File

**Actor**: User
**Precondition**: User has a CSV/Excel file with customer data

**Main Flow**:
1. User clicks "Import" button
2. System opens file dialog
3. User selects CSV/Excel file
4. System validates file format
5. System parses file contents
6. System validates each row (name, email, phone)
7. System creates customer records
8. System displays import results

**Alternative Flow**:
- 4a. Invalid file format: System shows error message
- 6a. Invalid row data: System skips row and records error
- 6b. Duplicate email: System skips row and records error

---

## UC2: View Customer List

**Actor**: User

**Main Flow**:
1. User opens application
2. System displays customer list (paginated)
3. User can navigate pages
4. User can search customers

---

## UC3: View Customer Detail

**Actor**: User

**Main Flow**:
1. User clicks on customer name
2. System displays customer information
3. System displays contact history
4. User can edit customer info
5. User can log new contact

---

## UC4: Send Cold Email

**Actor**: User
**Precondition**: SMTP is configured

**Main Flow**:
1. User navigates to Email page
2. System displays customer list with checkboxes
3. User selects recipients
4. User enters subject and body
5. User clicks Send
6. System sends emails via SMTP
7. System logs contact for each successful send
8. System displays results

**Alternative Flow**:
- 5a. SMTP not configured: System shows warning
- 7a. Send failed: System records error and continues
