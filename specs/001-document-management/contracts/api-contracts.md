# API Contracts: Document Management System

**Feature**: 001-document-management
**Date**: 2025-01-14
**Phase**: 1 - Design & Contracts

## Overview

This document defines the API contracts between the frontend and backend services. The system uses RESTful API patterns with JSON request/response bodies. All endpoints require Bearer token authentication via Auth0.

**Base URL**: `https://api.example.com/v2` (configured via environment variable)
**Authentication**: Bearer token in Authorization header
**Content-Type**: `application/json` (except file uploads which use `multipart/form-data`)

## Response Format

### Success Response
```typescript
{
  data: T,           // Response data (varies by endpoint)
  status: number     // HTTP status code (implicit in response)
}
```

### Error Response
```typescript
{
  error: {
    message: string,     // Human-readable error message
    code: string,        // Error code (e.g., "NOT_FOUND", "VALIDATION_ERROR")
    details?: any        // Additional error details
  },
  status: number     // HTTP status code (400, 404, 500, etc.)
}
```

### Pagination Response
```typescript
{
  data: T[],           // Array of items
  total: number,       // Total number of items matching query
  page: number,        // Current page number (1-indexed)
  pageSize: number,    // Number of items per page
  totalPages: number   // Total number of pages
}
```

## Document Endpoints

### GET /documents

Search and filter documents with pagination.

**Request**:
```typescript
GET /documents?
  searchText={string}&
  status={string}&
  dateFrom={ISO date}&
  dateTo={ISO date}&
  personInChargeIds={string[]}&
  documentTypeIds={string[]}&
  sortBy={string}&
  sortOrder={string}&
  page={number}&
  pageSize={number}

Headers:
  Authorization: Bearer {token}
  Accept: application/json
```

**Query Parameters**:
- `searchText` (optional): Filter by document name (case-insensitive contains)
- `status` (optional): Filter by status (can be multiple)
  - Values: `processing`, `done`, `confirmed`, `error`
- `dateFrom` (optional): Filter documents created on or after this date
- `dateTo` (optional): Filter documents created before this date
- `personInChargeIds` (optional): Filter by assigned user IDs
- `documentTypeIds` (optional): Filter by document type IDs
- `sortBy` (optional): Sort column (default: `createdAt`)
  - Values: `name`, `createdAt`, `status`, `personInCharge`
- `sortOrder` (optional): Sort direction (default: `desc`)
  - Values: `asc`, `desc`
- `page` (optional): Page number (default: `1`)
- `pageSize` (optional): Items per page (default: `50`, max: `100`)

**Response**: `SearchResults<Document>`
```typescript
{
  data: [
    {
      id: string,
      name: string,
      status: 'processing' | 'done' | 'confirmed' | 'error',
      createdAt: string,           // ISO 8601 timestamp
      updatedAt: string,           // ISO 8601 timestamp
      personInCharge: {
        id: string,
        name: string,
        email: string
      } | null,
      documentType: {
        id: string,
        name: string
      } | null,
      pageCount: number,
      organizationId: string
    }
  ],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks permission

---

### GET /documents/{id}

Get a single document by ID with full details including extracted fields and tables.

**Request**:
```typescript
GET /documents/{id}

Headers:
  Authorization: Bearer {token}
  Accept: application/json

Path Parameters:
  id: string  // Document UUID
```

**Response**: `RawDocument` (from @netsmile/page-edit-component)
```typescript
{
  id: string,
  name: string,
  status: 'processing' | 'done' | 'confirmed' | 'error',
  createdAt: string,
  updatedAt: string,
  personInCharge: {
    id: string,
    name: string,
    email: string
  } | null,
  documentType: {
    id: string,
    name: string,
    documentType: string,
    fieldsPrompt: PromptItem[],
    extractTable: boolean
  } | null,
  fileUrl: string,              // Signed URL to PDF
  pageCount: number,
  extractedFields: [
    {
      key: string,
      label: string,
      value: string,
      type: 'text' | 'number' | 'date' | 'boolean',
      confidence: number,
      isValid: boolean,
      validationMessage: string | null
    }
  ],
  detectedTables: [
    {
      id: string,
      tableId: string,
      page: number,
      boundingBox: {
        x: number,
        y: number,
        width: number,
        height: number
      },
      rowCount: number,
      columnCount: number,
      headers: string[],
      rows: string[][],
      confidence: number
    }
  ],
  errorMessage: string | null,
  organizationId: string
}
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks permission to access this document
- `404 Not Found`: Document not found

---

### PUT /documents/{id}

Update document metadata and extracted data.

**Request**:
```typescript
PUT /documents/{id}

Headers:
  Authorization: Bearer {token}
  Accept: application/json
  Content-Type: application/json

Path Parameters:
  id: string  // Document UUID

Body:
{
  name: string,
  personInChargeId: string | null,
  extractedFields: [
    {
      key: string,
      value: string
    }
  ],
  detectedTables: [
    {
      tableId: string,
      rows: [
        {
          boxId: string,
          x: number,
          y: number,
          width: number,
          height: number
        }
      ]
    }
  ]
}
```

**Request Fields**:
- `name` (required): Updated document name
- `personInChargeId` (optional): ID of user to assign (null to unassign)
- `extractedFields` (optional): Array of field key-value pairs to update
- `detectedTables` (optional): Array of table row corrections

**Response**: `RawDocument` (same as GET /documents/{id})

**Status Codes**:
- `200 OK`: Document updated successfully
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks permission to edit this document
- `404 Not Found`: Document not found
- `409 Conflict`: Concurrent modification conflict

---

### POST /documents

Upload a new document for processing.

**Request**:
```typescript
POST /documents

Headers:
  Authorization: Bearer {token}
  Accept: application/json
  Content-Type: multipart/form-data

Body (multipart/form-data):
{
  file: File,              // PDF file
  documentTypeId: string,  // Document type to use for processing
  name?: string            // Optional custom name (defaults to filename)
}
```

**Request Fields**:
- `file` (required): PDF file (max size: 50MB)
- `documentTypeId` (required): ID of document type definition
- `name` (optional): Custom document name

**Response**: `RawDocument` (same as GET /documents/{id})
```typescript
{
  id: string,
  name: string,
  status: 'processing',  // Always 'processing' for new uploads
  createdAt: string,
  // ... (other fields)
}
```

**Status Codes**:
- `201 Created`: Document uploaded successfully
- `400 Bad Request`: Invalid file type or size
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks permission
- `404 Not Found`: Document type not found

---

### POST /documents/{id}/rescan

Re-queue a failed document for processing.

**Request**:
```typescript
POST /documents/{id}/rescan

Headers:
  Authorization: Bearer {token}
  Accept: application/json

Path Parameters:
  id: string  // Document UUID
```

**Response**: `RawDocument` (same as GET /documents/{id})
```typescript
{
  id: string,
  status: 'processing',  // Reset to 'processing'
  // ... (other fields)
}
```

**Status Codes**:
- `200 OK`: Rescan initiated successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks permission
- `404 Not Found`: Document not found

---

### GET /documents/{id}/download

Get a download URL for the original PDF file.

**Request**:
```typescript
GET /documents/{id}/download

Headers:
  Authorization: Bearer {token}
  Accept: application/json

Path Parameters:
  id: string  // Document UUID
```

**Response**:
```typescript
{
  downloadUrl: string,  // Signed URL for direct download
  expiresAt: string     // ISO 8601 timestamp when URL expires
}
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks permission
- `404 Not Found`: Document not found

---

## Document Type Endpoints

### GET /document-types

Search and filter document types with pagination.

**Request**:
```typescript
GET /document-types?
  searchText={string}&
  sortBy={string}&
  sortOrder={string}&
  page={number}&
  pageSize={number}

Headers:
  Authorization: Bearer {token}
  Accept: application/json
```

**Query Parameters**:
- `searchText` (optional): Filter by name (case-insensitive contains)
- `sortBy` (optional): Sort column (default: `name`)
  - Values: `name`, `createdAt`
- `sortOrder` (optional): Sort direction (default: `asc`)
- `page` (optional): Page number (default: `1`)
- `pageSize` (optional): Items per page (default: `50`)

**Response**: `SearchResults<Definition>`
```typescript
{
  data: [
    {
      id: string,
      name: string,
      nameJpn: string | null,
      shortName: string | null,
      shortNameJpn: string | null,
      documentType: string,
      description: string | null,
      extractTable: boolean,
      fieldsPrompt: PromptItem[],
      tablePrompt: PromptItem[],
      systemPrompt: string | null,
      textualTablePrompt: string | null,
      userCustomInstructions: string | null,
      isPreset: boolean,
      createdAt: string,
      updatedAt: string
    }
  ],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

**Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid token

---

### GET /document-types/{id}

Get a single document type by ID.

**Request**:
```typescript
GET /document-types/{id}

Headers:
  Authorization: Bearer {token}
  Accept: application/json

Path Parameters:
  id: string  // Document type UUID
```

**Response**: `Definition` (same as in search results above)

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Document type not found

---

### POST /document-types

Create a new document type definition.

**Request**:
```typescript
POST /document-types

Headers:
  Authorization: Bearer {token}
  Accept: application/json
  Content-Type: application/json

Body:
{
  name: string,
  nameJpn?: string,
  shortName?: string,
  shortNameJpn?: string,
  documentType: string,
  description?: string,
  extractTable?: boolean,
  fieldsPrompt?: PromptItem[],
  tablePrompt?: PromptItem[],
  systemPrompt?: string,
  textualTablePrompt?: string,
  userCustomInstructions?: string
}
```

**Request Fields**:
- `name` (required): Document type name
- `nameJpn` (optional): Japanese name
- `shortName` (optional): Short display name
- `shortNameJpn` (optional): Japanese short name
- `documentType` (required): Type category
- `description` (optional): Detailed description
- `extractTable` (optional): Whether to extract tables (default: false)
- `fieldsPrompt` (optional): Array of field extraction prompts
- `tablePrompt` (optional): Array of table extraction prompts
- `systemPrompt` (optional): Custom AI instructions
- `textualTablePrompt` (optional): Table extraction instructions
- `userCustomInstructions` (optional): Additional custom instructions

**Response**: `Definition` (same as GET /document-types/{id})

**Status Codes**:
- `201 Created`: Document type created successfully
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Missing or invalid token

---

### PUT /document-types/{id}

Update an existing document type definition.

**Request**:
```typescript
PUT /document-types/{id}

Headers:
  Authorization: Bearer {token}
  Accept: application/json
  Content-Type: application/json

Path Parameters:
  id: string  // Document type UUID

Body:
{
  name?: string,
  nameJpn?: string,
  shortName?: string,
  shortNameJpn?: string,
  documentType?: string,
  description?: string,
  extractTable?: boolean,
  fieldsPrompt?: PromptItem[],
  tablePrompt?: PromptItem[],
  systemPrompt?: string,
  textualTablePrompt?: string,
  userCustomInstructions?: string
}
```

**Response**: `Definition` (same as GET /document-types/{id})

**Status Codes**:
- `200 OK`: Document type updated successfully
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Document type not found

---

### DELETE /document-types/{id}

Delete a document type definition.

**Request**:
```typescript
DELETE /document-types/{id}

Headers:
  Authorization: Bearer {token}
  Accept: application/json

Path Parameters:
  id: string  // Document type UUID
```

**Response**:
```typescript
{
  message: string  // Success message
}
```

**Status Codes**:
- `200 OK`: Document type deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Document type not found
- `409 Conflict`: Document type is referenced by existing documents

---

## User Endpoints

### GET /users

Search for users in the organization.

**Request**:
```typescript
GET /users?
  searchText={string}&
  page={number}&
  pageSize={number}

Headers:
  Authorization: Bearer {token}
  Accept: application/json
```

**Query Parameters**:
- `searchText` (optional): Filter by name or email (case-insensitive contains)
- `page` (optional): Page number (default: `1`)
- `pageSize` (optional): Items per page (default: `50`)

**Response**: `SearchResults<User>`
```typescript
{
  data: [
    {
      id: string,
      name: string,
      email: string,
      organizationId: string,
      role: 'admin' | 'user' | 'viewer',
      createdAt: string,
      lastLogin: string | null
    }
  ],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid token

---

### GET /users/{id}

Get a single user by ID.

**Request**:
```typescript
GET /users/{id}

Headers:
  Authorization: Bearer {token}
  Accept: application/json

Path Parameters:
  id: string  // User UUID
```

**Response**: `User` (same as in search results above)

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found

---

## Organization Endpoints

### GET /organization/settings

Get organization settings.

**Request**:
```typescript
GET /organization/settings

Headers:
  Authorization: Bearer {token}
  Accept: application/json
```

**Response**:
```typescript
{
  id: string,
  name: string,
  settings: {
    hideASRAlphaUploadUI: boolean,
    customBranding: {
      logoUrl: string | null,
      primaryColor: string | null
    } | null
  }
}
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid token

---

## Utility Endpoints

### GET /health

Health check endpoint.

**Request**:
```typescript
GET /health

Headers:
  Accept: application/json
```

**Response**:
```typescript
{
  status: 'ok',
  timestamp: string
}
```

**Status Codes**:
- `200 OK`: Service is healthy

---

## Type Definitions

### PromptItem
```typescript
interface PromptItem {
  key: string;          // Field identifier
  label: string;        // Human-readable label
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
  validation?: {
    regex?: string;     // Regex pattern for text fields
    min?: number;       // Minimum value for number/date
    max?: number;       // Maximum value for number/date
  };
}
```

### BoundingBox
```typescript
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### SearchParams
```typescript
interface SearchParams {
  sortBy?: string;
  sortOrder: 'a' | 'd';  // 'a' = ascending, 'd' = descending
}
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 400 | `INVALID_FILE_TYPE` | Uploaded file is not a PDF |
| 400 | `FILE_TOO_LARGE` | File size exceeds limit |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | User lacks permission for this resource |
| 404 | `NOT_FOUND` | Resource not found |
| 404 | `DOCUMENT_NOT_FOUND` | Document not found |
| 404 | `DEFINITION_NOT_FOUND` | Document type not found |
| 404 | `USER_NOT_FOUND` | User not found |
| 404 | `ORGANIZATION_NOT_FOUND` | Organization not found |
| 409 | `CONFLICT` | Resource conflict (concurrent modification) |
| 409 | `DEFINITION_IN_USE` | Document type is referenced by documents |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Authentication

### Token Management

**Token Source**: Auth0 OAuth 2.0 flow
**Token Type**: Bearer token (JWT)
**Token Storage**: httpOnly cookie (managed by Auth0 SDK)
**Token Refresh**: Automatic via Auth0 SDK

### Authenticated Request Pattern
```typescript
// Client-side
const apiClient = getApiClient(); // Gets token from Auth0 context
const documents = await apiClient.searchDocuments(filters, sorting, page, pageSize);

// Server-side
const apiClient = await getServerApiClient(); // Gets token from session
const document = await apiClient.getDocument(id);
```

---

## Rate Limiting

**Default Limits** (configurable per organization):
- 100 requests per minute per user
- 1000 requests per minute per organization

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Response on Rate Limit Exceeded**:
```typescript
{
  error: {
    message: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED"
  },
  status: 429
}
```

---

## File Upload Constraints

**File Type**: PDF only
**File Size**: Maximum 50MB
**Virus Scanning**: Files scanned asynchronously
**Processing Time**: Typically 1-5 minutes (varies by document complexity)

---

## Webhook Events (Future Enhancement)

Not currently implemented, but planned for:
- `document.processed`: Fired when document processing completes
- `document.failed`: Fired when document processing fails
- `document.confirmed`: Fired when user confirms document data

---

**Note**: These API contracts document the existing implementation. All endpoints are currently implemented and operational in the TemplatelessApiV2Client.
