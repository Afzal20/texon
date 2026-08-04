# Texon Backend API Documentation

Base URL: `http://localhost:8000`

All endpoints require JWT authentication unless noted. Include the token in the `Authorization` header as `Bearer <token>`.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Commercial Management](#commercial-management)
3. [Accounts](#accounts)
4. [Orders](#orders)
5. [Buyers](#buyers)
6. [Testing with Postman](#testing-with-postman)

---

## Authentication

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/register/` | POST | Create a new user |
| `/api/v1/login/` | POST | Get JWT access + refresh tokens |
| `/api/v1/refresh/` | POST | Refresh an expired access token |
| `/api/v1/logout/` | POST | Blacklist the refresh token |
| `/api/v1/me/` | GET | Get current user profile |
| `/api/v1/update-password/` | PUT | Change password |
| `/api/v1/forgot-password/` | POST | Send password reset OTP |
| `/api/v1/verify-otp/` | POST | Verify OTP code |
| `/api/v1/reset-password/` | POST | Reset password with OTP |

### POST `/api/v1/login/`

**Input (JSON body):**
```json
{
  "email": "test@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access": "eyJhbGciOi...",
  "refresh": "eyJhbGciOi..."
}
```

### POST `/api/v1/refresh/`

**Input:**
```json
{
  "refresh": "eyJhbGciOi..."
}
```

### POST `/api/v1/register/`

**Input:**
```json
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

## Commercial Management

All commercial endpoints are prefixed with `/api/v1/`.

### Shipments

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/shipments/` | GET, POST | List or create shipments |
| `/api/v1/shipments/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete a shipment |
| `/api/v1/shipments/dashboard-summary/` | GET | Shipment dashboard statistics |

**POST `/api/v1/shipments/` — Create Shipment**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| shipment_number | string | Yes | Unique shipment number |
| buyer | integer | No | Buyer ID |
| supplier | integer | No | Supplier ID |
| direction | string | Yes | `import` or `export` |
| shipment_type | string | Yes | `sea`, `air`, `land`, `rail` |
| port_of_loading | string | No | Port of loading |
| port_of_discharge | string | No | Port of discharge |
| container_number | string | No | Container number |
| container_size | string | No | `20ft`, `40ft`, `40hq` |
| forwarder | string | No | Freight forwarder name |
| vessel_name | string | No | Vessel name |
| carrier | string | No | Shipping carrier |
| shipment_date | date | No | Format: `YYYY-MM-DD` |
| etd | date | No | Estimated time of departure |
| eta | date | No | Estimated time of arrival |
| status | string | Yes | `draft`, `booked`, `loaded`, `shipped`, `in_transit`, `arrived`, `cleared`, `delivered`, `cancelled` |
| clearance_status | string | No | `pending`, `in_progress`, `cleared`, `on_hold` |
| gross_weight | decimal | No | Gross weight in kg |
| net_weight | decimal | No | Net weight in kg |
| volume_cbm | decimal | No | Volume in cubic meters |
| notes | string | No | Free text notes |

**Example Request:**
```json
{
  "organization": 1,
  "shipment_number": "SHP-2420",
  "buyer": 1,
  "supplier": 1,
  "direction": "import",
  "shipment_type": "sea",
  "port_of_loading": "Shanghai",
  "port_of_discharge": "Chittagong",
  "container_number": "COSU1234567",
  "carrier": "COSCO",
  "shipment_date": "2024-11-01",
  "eta": "2024-11-15",
  "status": "booked",
  "gross_weight": 18500.00
}
```

**GET `/api/v1/shipments/?direction=import&status=in_transit`**

**Query Parameters:**
| Param | Description |
|---|---|
| direction | Filter by `import` or `export` |
| status | Filter by shipment status |
| shipment_type | Filter by `sea`, `air`, `land` |
| search | Search in shipment_number, container_number, forwarder |
| ordering | Order by `shipment_date`, `eta`, `created_at` |
| page | Page number |
| page_size | Results per page (max 100) |

---

### Letters of Credit (LCs)

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/lcs/` | GET, POST | List or create LCs |
| `/api/v1/lcs/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete an LC |

**POST `/api/v1/lcs/` — Create LC**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| lc_number | string | Yes | Unique LC number |
| lc_type | string | Yes | `import`, `export`, `btb` |
| buyer | integer | No | Buyer ID |
| supplier | integer | No | Supplier ID |
| parent_lc | integer | No | Parent LC ID (for BTB) |
| amount | decimal | Yes | LC amount |
| currency | integer | No | Currency ID |
| issue_date | date | No | Format: `YYYY-MM-DD` |
| expiry_date | date | No | Format: `YYYY-MM-DD` |
| bank_name | string | No | Issuing bank name |
| status | string | Yes | `draft`, `issued`, `amended`, `extended`, `utilized`, `expired`, `cancelled` |
| notes | string | No | Free text |

**Example Request:**
```json
{
  "organization": 1,
  "lc_number": "LC-8850",
  "lc_type": "export",
  "buyer": 1,
  "amount": 500000.00,
  "currency": 1,
  "issue_date": "2024-11-01",
  "expiry_date": "2024-12-31",
  "bank_name": "HSBC",
  "status": "issued"
}
```

**GET `/api/v1/lcs/?lc_type=export&status=issued`**

**Query Parameters:**
| Param | Description |
|---|---|
| lc_type | Filter by `import`, `export`, `btb` |
| status | Filter by LC status |
| search | Search in lc_number, bank_name |
| ordering | Order by `issue_date`, `expiry_date`, `amount` |

---

### Invoices

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/invoices/` | GET, POST | List or create invoices |
| `/api/v1/invoices/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete an invoice |

**POST `/api/v1/invoices/` — Create Invoice**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| invoice_number | string | Yes | Unique invoice number |
| buyer | integer | No | Buyer ID |
| supplier | integer | No | Supplier ID |
| purchase_order | integer | No | Order ID |
| lc | integer | No | LC ID |
| invoice_date | date | No | Format: `YYYY-MM-DD` |
| due_date | date | No | Format: `YYYY-MM-DD` |
| amount | decimal | Yes | Invoice amount |
| currency | integer | No | Currency ID |
| invoice_type | string | Yes | `commercial`, `proforma`, `credit_note`, `debit_note` |
| status | string | Yes | `draft`, `submitted`, `approved`, `paid`, `partial`, `overdue`, `cancelled` |
| paid_amount | decimal | No | Amount already paid (default 0) |
| payment_terms | string | No | e.g., `Net 30` |
| notes | string | No | Free text |

**Example Request:**
```json
{
  "organization": 1,
  "invoice_number": "INV-2420",
  "buyer": 1,
  "lc": 1,
  "invoice_date": "2024-11-05",
  "due_date": "2024-12-05",
  "amount": 250000.00,
  "invoice_type": "commercial",
  "status": "draft",
  "payment_terms": "Net 30"
}
```

---

### Bills of Exchange

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/bills-of-exchange/` | GET, POST | List or create bills |
| `/api/v1/bills-of-exchange/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete a bill |

**POST `/api/v1/bills-of-exchange/` — Create Bill**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| bill_number | string | Yes | Unique bill number |
| lc | integer | No | LC ID |
| buyer | integer | No | Buyer ID |
| bank_name | string | No | Bank name |
| amount | decimal | Yes | Bill amount |
| currency | integer | No | Currency ID |
| issue_date | date | No | Format: `YYYY-MM-DD` |
| maturity_date | date | No | Format: `YYYY-MM-DD` |
| status | string | Yes | `draft`, `submitted`, `under_review`, `accepted`, `negotiated`, `paid`, `rejected` |
| notes | string | No | Free text |

**Example Request:**
```json
{
  "organization": 1,
  "bill_number": "BDE-2420",
  "lc": 1,
  "buyer": 1,
  "bank_name": "Citibank",
  "amount": 428600.00,
  "issue_date": "2024-11-10",
  "maturity_date": "2024-12-10",
  "status": "draft"
}
```

---

### Supplier Documents

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/supplier-documents/` | GET, POST | List or create documents |
| `/api/v1/supplier-documents/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/supplier-documents/` — Create Document**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| document_number | string | Yes | Unique document number |
| supplier | integer | Yes | Supplier ID |
| shipment | integer | No | Shipment ID |
| document_type | string | Yes | `bill_of_lading`, `commercial_invoice`, `packing_list`, `certificate_of_origin`, `inspection_report`, `insurance`, `other` |
| received_date | date | No | Format: `YYYY-MM-DD` |
| status | string | Yes | `pending`, `accepted`, `rejected`, `resubmitted` |
| notes | string | No | Free text |

**Example Request:**
```json
{
  "organization": 1,
  "document_number": "DOC-2420-1",
  "supplier": 1,
  "shipment": 1,
  "document_type": "bill_of_lading",
  "received_date": "2024-11-15",
  "status": "pending"
}
```

---

### Realizations

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/realizations/` | GET, POST | List or create realizations |
| `/api/v1/realizations/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/realizations/` — Create Realization**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| realization_number | string | Yes | Unique realization number |
| buyer | integer | Yes | Buyer ID |
| invoice | integer | Yes | Invoice ID |
| expected_amount | decimal | Yes | Expected amount |
| realized_amount | decimal | No | Actual realized amount (default 0) |
| currency | integer | No | Currency ID |
| realization_date | date | No | Format: `YYYY-MM-DD` |
| due_date | date | No | Format: `YYYY-MM-DD` |
| status | string | Yes | `expected`, `realized`, `overdue`, `partial`, `short` |
| short_reason | string | No | `quality_deduction`, `rate_dispute`, `quantity_variance`, `delay_penalty`, `damage_deduction`, `other` |
| short_amount | decimal | No | Shortfall amount (default 0) |
| notes | string | No | Free text |

**Example Request:**
```json
{
  "organization": 1,
  "realization_number": "RLZ-2420",
  "buyer": 1,
  "invoice": 1,
  "expected_amount": 428600.00,
  "realized_amount": 420000.00,
  "status": "short",
  "short_reason": "quality_deduction",
  "short_amount": 8600.00,
  "due_date": "2024-12-15"
}
```

---

### SOD/FC Transfers

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/sod-fc-transfers/` | GET, POST | List or create transfers |
| `/api/v1/sod-fc-transfers/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/sod-fc-transfers/` — Create Transfer**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| transfer_number | string | Yes | Unique transfer number |
| transfer_type | string | Yes | `sod` or `fc` |
| bank_name | string | No | Bank name |
| amount | decimal | Yes | Transfer amount |
| currency | integer | No | Currency ID |
| transfer_date | date | No | Format: `YYYY-MM-DD` |
| status | string | Yes | `pending`, `acknowledged`, `rejected` |
| notes | string | No | Free text |

**Example Request:**
```json
{
  "organization": 1,
  "transfer_number": "TRF-2420",
  "transfer_type": "fc",
  "bank_name": "HSBC",
  "amount": 350000.00,
  "transfer_date": "2024-11-20",
  "status": "pending"
}
```

---

### Disbursements

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/disbursements/` | GET, POST | List or create disbursements |
| `/api/v1/disbursements/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/disbursements/` — Create Disbursement**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| disbursement_number | string | Yes | Unique disbursement number |
| category | string | Yes | `material_purchase`, `freight_charges`, `customs_duty`, `supplier_payment`, `bank_charges`, `insurance`, `other` |
| purchase_order | integer | No | Order ID |
| invoice | integer | No | Invoice ID |
| shipment | integer | No | Shipment ID |
| amount | decimal | Yes | Disbursement amount |
| currency | integer | No | Currency ID |
| disbursement_date | date | No | Format: `YYYY-MM-DD` |
| status | string | Yes | `draft`, `pending_approval`, `approved`, `disbursed`, `rejected` |
| notes | string | No | Free text |

**Example Request:**
```json
{
  "organization": 1,
  "disbursement_number": "DIS-2420",
  "category": "freight_charges",
  "amount": 45000.00,
  "disbursement_date": "2024-11-22",
  "status": "pending_approval"
}
```

---

## Accounts

### Chart of Accounts

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/chart-of-accounts/` | GET, POST | List or create accounts |
| `/api/v1/chart-of-accounts/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/chart-of-accounts/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| account_code | string | Yes | Unique account code |
| account_name | string | Yes | Account name |
| account_type | string | Yes | `asset`, `liability`, `equity`, `revenue`, `expense` |
| parent | integer | No | Parent account ID |
| is_active | boolean | No | Default: true |

**Example:**
```json
{
  "organization": 1,
  "account_code": "1001",
  "account_name": "Cash in Hand",
  "account_type": "asset",
  "is_active": true
}
```

---

### Journal Entries

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/journal-entries/` | GET, POST | List or create entries |
| `/api/v1/journal-entries/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/journal-entries/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| entry_number | string | Yes | Unique entry number |
| entry_date | date | Yes | Format: `YYYY-MM-DD` |
| description | string | No | Description |
| account | integer | Yes | Chart of account ID |
| debit | decimal | No | Debit amount |
| credit | decimal | No | Credit amount |
| currency | integer | No | Currency ID |
| reference | string | No | Reference string |
| created_by | string | Yes | Creator name |

**Example:**
```json
{
  "organization": 1,
  "entry_number": "JE-2420-001",
  "entry_date": "2024-11-20",
  "description": "Payment to supplier",
  "account": 1,
  "debit": 50000.00,
  "credit": 0,
  "created_by": "Finance Manager"
}
```

---

### Accounts Payable

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/accounts-payable/` | GET, POST | List or create payables |
| `/api/v1/accounts-payable/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/accounts-payable/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| supplier | integer | Yes | Supplier ID |
| invoice_number | string | Yes | Invoice number |
| invoice_date | date | Yes | Format: `YYYY-MM-DD` |
| due_date | date | Yes | Format: `YYYY-MM-DD` |
| amount | decimal | Yes | Total amount |
| paid_amount | decimal | No | Amount paid (default 0) |
| balance | decimal | Yes | Remaining balance |
| status | string | Yes | `pending`, `partial`, `paid`, `overdue` |
| notes | string | No | Free text |

**Example:**
```json
{
  "organization": 1,
  "supplier": 1,
  "invoice_number": "AP-2420-001",
  "invoice_date": "2024-11-20",
  "due_date": "2024-12-20",
  "amount": 125000.00,
  "paid_amount": 0,
  "balance": 125000.00,
  "status": "pending"
}
```

---

### Accounts Receivable

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/accounts-receivable/` | GET, POST | List or create receivables |
| `/api/v1/accounts-receivable/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/accounts-receivable/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| buyer | integer | Yes | Buyer ID |
| invoice_number | string | Yes | Invoice number |
| invoice_date | date | Yes | Format: `YYYY-MM-DD` |
| due_date | date | Yes | Format: `YYYY-MM-DD` |
| amount | decimal | Yes | Total amount |
| received_amount | decimal | No | Amount received (default 0) |
| balance | decimal | Yes | Remaining balance |
| status | string | Yes | `pending`, `partial`, `received`, `overdue` |
| notes | string | No | Free text |

**Example:**
```json
{
  "organization": 1,
  "buyer": 1,
  "invoice_number": "AR-2420-001",
  "invoice_date": "2024-11-20",
  "due_date": "2024-12-20",
  "amount": 350000.00,
  "received_amount": 0,
  "balance": 350000.00,
  "status": "pending"
}
```

---

### Expenses

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/expenses/` | GET, POST | List or create expenses |
| `/api/v1/expenses/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/expenses/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| cost_center | integer | No | Cost center ID |
| expense_date | date | Yes | Format: `YYYY-MM-DD` |
| category | string | Yes | Expense category |
| description | string | Yes | Description |
| amount | decimal | Yes | Expense amount |
| currency | integer | No | Currency ID |
| status | string | Yes | `draft`, `pending`, `approved`, `rejected` |
| created_by | string | Yes | Creator name |
| notes | string | No | Free text |

**Example:**
```json
{
  "organization": 1,
  "expense_date": "2024-11-20",
  "category": "Travel",
  "description": "Client visit to factory",
  "amount": 2500.00,
  "status": "draft",
  "created_by": "Sales Manager"
}
```

---

### Cost Centers

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/cost-centers/` | GET, POST | List or create cost centers |
| `/api/v1/cost-centers/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |

**POST `/api/v1/cost-centers/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| name | string | Yes | Cost center name |
| code | string | Yes | Unique code |
| department | string | No | Department name |
| budget | decimal | No | Budget amount (default 0) |
| is_active | boolean | No | Default: true |

**Example:**
```json
{
  "organization": 1,
  "name": "Production Department",
  "code": "CC-PROD",
  "department": "Manufacturing",
  "budget": 5000000.00
}
```

---

## Orders

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/orders/` | GET, POST | List or create orders |
| `/api/v1/orders/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |
| `/api/v1/orders/dashboard-summary/` | GET | Order dashboard statistics |

**POST `/api/v1/orders/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| buyer | integer | Yes | Buyer ID |
| style | integer | Yes | Style ID |
| order_number | string | Yes | Unique order number |
| order_date | date | Yes | Format: `YYYY-MM-DD` |
| delivery_date | date | Yes | Format: `YYYY-MM-DD` |
| quantity | integer | Yes | Order quantity |
| unit_price | decimal | Yes | Unit price |
| total_value | decimal | Yes | Total order value |
| status | string | Yes | `pending`, `confirmed`, `in_production`, `shipped`, `delivered`, `cancelled` |
| priority | string | No | `low`, `medium`, `high`, `urgent` |
| notes | string | No | Free text |

**Example:**
```json
{
  "organization": 1,
  "buyer": 1,
  "style": 1,
  "order_number": "PO-85400",
  "order_date": "2024-11-20",
  "delivery_date": "2025-02-15",
  "quantity": 5000,
  "unit_price": 14.50,
  "total_value": 72500.00,
  "status": "pending",
  "priority": "high"
}
```

---

## Buyers

| Endpoint | Methods | Description |
|---|---|---|
| `/api/v1/buyers/` | GET, POST | List or create buyers |
| `/api/v1/buyers/{id}/` | GET, PUT, PATCH, DELETE | Retrieve, update, or delete |
| `/api/v1/buyer-ratings/` | GET, POST | List or create buyer ratings |
| `/api/v1/buyer-portfolios/` | GET, POST | List or create buyer portfolios |

**POST `/api/v1/buyers/`**

**Input fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| organization | integer | Yes | Organization ID |
| name | string | Yes | Buyer name |
| code | string | Yes | Unique buyer code |
| country | string | Yes | Country name |
| address | string | No | Address |
| contact_person | string | No | Contact person name |
| email | string | No | Email address |
| phone | string | No | Phone number |
| is_active | boolean | No | Default: true |

**Example:**
```json
{
  "organization": 1,
  "name": "Walmart Inc.",
  "code": "WMT",
  "country": "USA",
  "contact_person": "Jane Smith",
  "email": "jane@walmart.com",
  "phone": "+1-555-0123"
}
```

---

## Testing with Postman

### Step 1: Get Authentication Token

1. Open Postman and create a new request
2. Set method to **POST**
3. Enter URL: `http://localhost:8000/api/v1/login/`
4. Go to **Body** tab → select **raw** → **JSON**
5. Enter:
```json
{
  "email": "test@example.com",
  "password": "yourpassword"
}
```
6. Click **Send**
7. Copy the `access` token from the response

### Step 2: Set Up Environment Variable (Optional)

1. Click the **Environment quick look** icon (eye icon) in the top right
2. Click **Add** to create a new environment
3. Add variable: `base_url` = `http://localhost:8000`
4. Add variable: `token` = (paste your access token)
5. Save and select the environment

### Step 3: Configure Authorization

For every subsequent request:
1. Go to **Authorization** tab
2. Select type: **Bearer Token**
3. Paste your access token in the **Token** field

Or use a header:
1. Go to **Headers** tab
2. Add: `Authorization` = `Bearer <your_token>`

### Step 4: Test Endpoints

#### List all shipments (GET)
```
GET http://localhost:8000/api/v1/shipments/
Headers: Authorization: Bearer <token>
```

#### Create a shipment (POST)
```
POST http://localhost:8000/api/v1/shipments/
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body (raw JSON):
{
  "organization": 1,
  "shipment_number": "SHP-TEST-001",
  "direction": "import",
  "shipment_type": "sea",
  "port_of_loading": "Shanghai",
  "port_of_discharge": "Chittagong",
  "status": "draft"
}
```

#### Get a specific shipment (GET)
```
GET http://localhost:8000/api/v1/shipments/1/
Headers: Authorization: Bearer <token>
```

#### Update a shipment (PATCH)
```
PATCH http://localhost:8000/api/v1/shipments/1/
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "status": "in_transit"
}
```

#### Delete a shipment (DELETE)
```
DELETE http://localhost:8000/api/v1/shipments/1/
Headers: Authorization: Bearer <token>
```

#### Filter shipments (GET with query params)
```
GET http://localhost:8000/api/v1/shipments/?direction=import&status=in_transit
Headers: Authorization: Bearer <token>
```

#### Search shipments (GET with search)
```
GET http://localhost:8000/api/v1/shipments/?search=COSCO
Headers: Authorization: Bearer <token>
```

#### Paginate results (GET with page params)
```
GET http://localhost:8000/api/v1/shipments/?page=1&page_size=10
Headers: Authorization: Bearer <token>
```

### Step 5: Test Commercial Endpoints

| Endpoint | Method | Body Example |
|---|---|---|
| `/api/v1/lcs/` | POST | `{"organization":1,"lc_number":"LC-TEST","lc_type":"export","amount":100000,"status":"issued"}` |
| `/api/v1/invoices/` | POST | `{"organization":1,"invoice_number":"INV-TEST","amount":50000,"invoice_type":"commercial","status":"draft"}` |
| `/api/v1/bills-of-exchange/` | POST | `{"organization":1,"bill_number":"BDE-TEST","amount":50000,"status":"draft"}` |
| `/api/v1/realizations/` | POST | `{"organization":1,"realization_number":"RLZ-TEST","buyer":1,"invoice":1,"expected_amount":50000,"status":"expected"}` |
| `/api/v1/disbursements/` | POST | `{"organization":1,"disbursement_number":"DIS-TEST","category":"freight_charges","amount":15000,"status":"draft"}` |

### Step 6: Test Error Handling

Try sending invalid data to see error responses:
```
POST http://localhost:8000/api/v1/shipments/
Body: {}
```
Response will include field-level validation errors.

### Step 7: Refresh Expired Token

When you get a 401 error:
```
POST http://localhost:8000/api/v1/refresh/
Body: {"refresh": "<your_refresh_token>"}
```

---

## Common Status Codes

| Code | Meaning |
|---|---|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Swagger Documentation

When running in debug mode, interactive API docs are available at:

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`
