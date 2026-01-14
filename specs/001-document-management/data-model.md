# Data Model: Document Management System

**Feature**: 001-document-management
**Date**: 2025-01-14
**Phase**: 1 - Design & Contracts

## Overview

This document describes the data entities, their attributes, relationships, and validation rules for the Document Management System. The data model is designed to support document processing workflows with metadata editing, search/filtering, and document type management.

## Entities

### 1. Document

Represents a processed document file uploaded by a user.

**Attributes**:
- `id` (string, UUID): Unique identifier for the document
- `name` (string, editable): Human-readable document name
- `status` (enum): Processing status
  - `processing`: Document is currently being processed
  - `done`: Processing completed successfully
  - `confirmed`: Document has been reviewed and confirmed by user
  - `error`: Processing failed
- `createdAt` (timestamp): Date/time when document was uploaded
- `updatedAt` (timestamp): Date/time when document was last modified
- `personInCharge` (object, nullable): User assigned to document
  - `id` (string): User's Auth0 ID
  - `name` (string): User's display name
  - `email` (string): User's email address
- `documentType` (object, nullable): Associated document type definition
  - `id` (string): Document type ID
  - `name` (string): Document type name
- `fileUrl` (string): URL to the PDF file in cloud storage
- `pageCount` (number): Total number of pages in the PDF
- `extractedFields` (array of ExtractedField): Data extracted from document
- `detectedTables` (array of DetectedTable): Tables detected in document
- `errorMessage` (string, nullable): Error details if status is 'error'
- `organizationId` (string): Organization that owns the document

**Relationships**:
- Belongs to one Organization (many-to-one)
- Assigned to one User (many-to-one, optional)
- Associated with one DocumentType (many-to-one, optional)
- Has many ExtractedFields (one-to-many)
- Has many DetectedTables (one-to-many)

**State Transitions**:
```
processing → done (on successful completion)
processing → error (on processing failure)
done → confirmed (on user confirmation)
error → processing (on retry/rescan)
```

**Validation Rules**:
- `name` must not be empty
- `status` must be one of: processing, done, confirmed, error
- `fileUrl` must be a valid HTTPS URL
- `pageCount` must be >= 1
- `organizationId` is required

---

### 2. DocumentType

Defines a template for processing documents with specific field extraction rules.

**Attributes**:
- `id` (string, UUID): Unique identifier for the document type
- `name` (string): Human-readable name (e.g., "Invoice", "Contract")
- `nameJpn` (string, nullable): Japanese name for i18n support
- `shortName` (string, nullable): Short name for UI display
- `shortNameJpn` (string, nullable): Japanese short name
- `description` (string, nullable): Detailed description
- `documentType` (string): Category/type classification
- `extractTable` (boolean): Whether to extract tables from documents
- `fieldsPrompt` (array of PromptItem): Field extraction prompts
  - `key` (string): Field identifier
  - `label` (string): Human-readable label
  - `type` (enum): text, number, date, boolean
  - `required` (boolean): Whether field is mandatory
  - `validation` (object, nullable): Validation rules (regex, min, max)
- `tablePrompt` (array of PromptItem): Table extraction prompts
- `systemPrompt` (string, nullable): Custom instructions for AI processing
- `textualTablePrompt` (string, nullable): Instructions for table extraction
- `userCustomInstructions` (string, nullable): Additional custom instructions
- `isPreset` (boolean): Whether this is a system preset or user-created
- `createdAt` (timestamp): Creation date/time
- `updatedAt` (timestamp): Last modification date/time
- `organizationId` (string): Organization that owns the document type

**Relationships**:
- Belongs to one Organization (many-to-one)
- Has many Documents (one-to-many)

**Validation Rules**:
- `name` must not be empty
- `documentType` must not be empty
- At least one field in `fieldsPrompt` if defined
- Field keys must be unique within `fieldsPrompt`

---

### 3. ExtractedField

Represents a single data point extracted from a document.

**Attributes**:
- `id` (string, UUID): Unique identifier
- `key` (string): Field identifier (matches DocumentType field definition)
- `label` (string): Human-readable label
- `value` (string, editable): Extracted value
- `type` (enum): Data type (text, number, date, boolean)
- `confidence` (number, nullable): AI confidence score (0-1)
- `isValid` (boolean): Whether value passes validation
- `validationMessage` (string, nullable): Error message if validation fails
- `boundingBox` (object, nullable): Location of field in PDF
  - `page` (number): Page number (1-indexed)
  - `x`, `y`, `width`, `height` (number): Bounding box coordinates

**Relationships**:
- Belongs to one Document (many-to-one)

**Validation Rules**:
- `key` must not be empty
- `label` must not be empty
- `value` can be null or empty string
- `confidence` must be between 0 and 1 if provided
- `type` must be one of: text, number, date, boolean

---

### 4. DetectedTable

Represents a tabular data structure detected in a document.

**Attributes**:
- `id` (string, UUID): Unique identifier
- `tableId` (string): Identifier for table reference
- `page` (number): Page number where table is located
- `boundingBox` (object): Table location in PDF
  - `x`, `y`, `width`, `height` (number): Coordinates
- `rowCount` (number): Number of data rows (excluding headers)
- `columnCount` (number): Number of columns
- `headers` (array of string): Column headers
- `rows` (array of array of string): Cell values (2D array)
  - Each row is an array of cell values
  - Cell values can be empty strings
- `confidence` (number, nullable): Overall detection confidence (0-1)

**Relationships**:
- Belongs to one Document (many-to-one)
- Has many TableRows (one-to-many, implicit in rows array)

**Validation Rules**:
- `page` must be >= 1
- `rowCount` must be >= 0
- `columnCount` must be >= 1
- `headers.length` must equal `columnCount`
- Each row in `rows` must have length equal to `columnCount`

---

### 5. TableRowDetection

Represents user corrections to detected table rows.

**Attributes**:
- `tableId` (string): Reference to DetectedTable
- `rows` (array of BoundingBoxWithId): Corrected row definitions
  - `boxId` (string): Unique identifier for row
  - `x`, `y`, `width`, `height` (number): Bounding box coordinates

**Relationships**:
- Associated with one DetectedTable

**Validation Rules**:
- `tableId` must reference existing table
- `rows` array can be empty
- Each row must have valid bounding box coordinates

---

### 6. User

Represents a system user who can manage documents.

**Attributes**:
- `id` (string, UUID): Auth0 user ID
- `name` (string): Display name
- `email` (string): Email address
- `organizationId` (string): Associated organization
- `role` (enum): User role
  - `admin`: Full system access
  - `user`: Standard user access
  - `viewer`: Read-only access
- `createdAt` (timestamp): Account creation date/time
- `lastLogin` (timestamp, nullable): Last login date/time

**Relationships**:
- Belongs to one Organization (many-to-one)
- Assigned to many Documents (one-to-many, optional)

**Validation Rules**:
- `email` must be valid email format
- `role` must be one of: admin, user, viewer
- `organizationId` is required

---

### 7. Organization

Represents an organization or company using the system.

**Attributes**:
- `id` (string, UUID): Unique identifier
- `name` (string): Organization name
- `settings` (object, nullable): Organization-specific settings
  - `hideASRAlphaUploadUI` (boolean): Hide upload functionality
  - `customBranding` (object, nullable): Branding configuration
- `createdAt` (timestamp): Organization creation date/time
- `updatedAt` (timestamp): Last modification date/time

**Relationships**:
- Has many Users (one-to-many)
- Has many Documents (one-to-many)
- Has many DocumentTypes (one-to-many)

**Validation Rules**:
- `name` must not be empty

---

### 8. SearchFilters

Represents search and filter criteria for document queries.

**Attributes**:
- `searchText` (string, nullable): Text search in document name
- `statuses` (array of string): Filter by status (processing, done, confirmed, error)
- `dateFrom` (date, nullable): Filter documents created after this date
- `dateTo` (date, nullable): Filter documents created before this date
- `personInChargeIds` (array of string): Filter by assigned users
- `documentTypeIds` (array of string): Filter by document types
- `sortBy` (enum): Sort column (name, createdAt, status, personInCharge)
- `sortOrder` (enum): Sort direction (asc, desc)
- `page` (number): Page number (1-indexed)
- `pageSize` (number): Number of items per page

**Relationships**:
- Transient object - not persisted, used for API queries

**Validation Rules**:
- `page` must be >= 1
- `pageSize` must be between 1 and 100
- `statuses` can only contain valid status values
- `sortBy` must be a valid sortable field
- `sortOrder` must be 'asc' or 'desc'

---

### 9. SearchResults<T>

Generic wrapper for paginated search results.

**Attributes**:
- `data` (array of T): Result items (Documents, DocumentTypes, etc.)
- `total` (number): Total number of items matching query
- `page` (number): Current page number
- `pageSize` (number): Number of items per page
- `totalPages` (number): Total number of pages

**Relationships**:
- Transient object - API response wrapper

**Validation Rules**:
- `data.length` must be <= `pageSize`
- `total` must be >= 0
- `page` must be >= 1 and <= `totalPages`
- `totalPages` = ceil(`total` / `pageSize`)

---

## Entity Relationship Diagram

```
Organization (1) ----< (many) Documents
Organization (1) ----< (many) DocumentTypes
Organization (1) ----< (many) Users

Document (many) ----> (1) DocumentType
Document (many) ----< (0..1) User (personInCharge)
Document (1) ----< (many) ExtractedFields
Document (1) ----< (many) DetectedTables

DetectedTable (1) ----< (many) TableRows (via rows array)
```

## Data Flow

### Document Upload Flow
```
1. User selects PDF file + DocumentType
2. File uploaded to API with metadata
3. API creates Document with status='processing'
4. Document queued for background processing
5. Processing service extracts fields and tables
6. Document updated with status='done' or 'error'
7. UI polls for status changes
```

### Document Edit Flow
```
1. User opens document detail page
2. Document data loaded (including ExtractedFields, DetectedTables)
3. User edits metadata (name, personInCharge)
4. User edits extracted field values
5. User clicks Save
6. Changes sent to API via PUT request
7. API updates Document and related entities
8. Success notification displayed
```

### Search Flow
```
1. User sets filters (status, date range, search text)
2. SearchFilters object constructed
3. API called with SearchFilters as query params
4. API returns SearchResults<Documents>
5. Results displayed in DataGrid
6. User changes page or sort
7. New API call with updated SearchFilters
8. Previous page cached in Zustand store
```

## Validation Summary

### Required Fields (Non-Nullable)
- Document: id, name, status, createdAt, updatedAt, fileUrl, pageCount, organizationId
- DocumentType: id, name, documentType, createdAt, updatedAt, organizationId
- ExtractedField: id, key, label, type
- DetectedTable: id, tableId, page, boundingBox, rowCount, columnCount, headers
- User: id, name, email, organizationId, role, createdAt
- Organization: id, name, createdAt

### Optional Fields (Nullable)
- Document: personInCharge, documentType, errorMessage
- DocumentType: nameJpn, shortName, shortNameJpn, description, systemPrompt, textualTablePrompt, userCustomInstructions
- ExtractedField: value, confidence, boundingBox, validationMessage
- DetectedTable: confidence
- User: lastLogin
- Organization: settings

### Enum Constraints
- Document.status: 'processing' | 'done' | 'confirmed' | 'error'
- ExtractedField.type: 'text' | 'number' | 'date' | 'boolean'
- User.role: 'admin' | 'user' | 'viewer'
- SearchFilters.sortBy: 'name' | 'createdAt' | 'status' | 'personInCharge'
- SearchFilters.sortOrder: 'asc' | 'desc'

### Type Constraints
- All timestamps: ISO 8601 date-time strings
- All IDs: UUID strings (or string-compatible format)
- Confidence scores: decimal between 0.0 and 1.0
- Page numbers: positive integers >= 1
- Counts (rowCount, pageCount): positive integers >= 0

## Indexing Strategy

### Database Indexes (Recommended)
- Documents: (organizationId, status), (createdAt), (personInChargeId), (documentTypeId)
- DocumentTypes: (organizationId, name)
- Users: (organizationId, email)
- ExtractedFields: (documentId, key)
- DetectedTables: (documentId, tableId)

### Search Optimization
- Full-text search on Document.name
- Date range queries on Document.createdAt
- Faceted search on Document.status and Document.documentType
- Compound indexes for common filter combinations

## Data Lifecycle

### Creation
- Document: Created on upload, never deleted (soft delete recommended)
- DocumentType: Created by admin or user, never deleted (mark as inactive instead)
- ExtractedField: Created during processing, updated on edit
- DetectedTable: Created during processing, updated on table correction

### Updates
- Document: Metadata edits, status changes, person in charge changes
- DocumentType: Field definitions, prompts, descriptions
- ExtractedField: Value edits, validation status
- DetectedTable: Row corrections (via TableRowDetection)

### Deletion
- **Hard delete not recommended** - use soft delete (isActive flag)
- Cascade delete not implemented - documents retain references to deleted DocumentTypes
- User deletion handled by Auth0 - documents reassigned or marked orphaned

## Data Integrity Rules

### Business Rules
1. A document cannot be deleted if it has status='processing'
2. A DocumentType cannot be deleted if it's referenced by active documents
3. A user cannot be assigned to documents from organizations they don't belong to
4. ExtractedField values must match their type definition (number validation for type='number')
5. DetectedTable rows must have consistent column count with headers

### Referential Integrity
- All Documents must have a valid organizationId
- All DocumentTypes must have a valid organizationId
- All Users must have a valid organizationId
- Document.personInCharge must reference a valid User (or null)
- Document.documentType must reference a valid DocumentType (or null)

## Security Considerations

### Data Access Control
- Users can only access documents from their organization
- Users can only edit documents they're assigned to (or have admin role)
- DocumentTypes are organization-scoped (no cross-org sharing)
- Person in charge can only be set to users in the same organization

### Sensitive Data
- Document fileUrl contains signed URLs with expiration
- User emails should not be exposed to non-admin users
- API tokens not stored in data model (handled via Auth0)

## Performance Considerations

### Large Document Support
- ExtractedFields and DetectedTables loaded on-demand (not in list view)
- Pagination for large result sets (max 100 items per page)
- Virtual scrolling in DataGrid for performance

### Caching Strategy
- Document list pages cached in Zustand store (by filter/sort combination)
- Document detail cached per-document (evicted on navigation away)
- DocumentTypes cached globally (refreshed on create/update/delete)

---

**Note**: This data model documents the existing implementation. All entities and relationships are currently implemented and operational in the codebase.
