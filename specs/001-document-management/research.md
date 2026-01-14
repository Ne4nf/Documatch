# Research: Document Management System

**Feature**: 001-document-management
**Date**: 2025-01-14
**Phase**: 0 - Outline & Research

## Overview

This research document captures the architectural decisions and technology choices made in the existing Document Management System (Documatch) implementation. Since this is a documentation effort for a fully implemented system, all research items have been "chosen" and are documented here for reference.

## Prior Work

### Previous Features and Tasks
- **No previous beads exist** - This is the initial specification effort documenting the existing Document Management System
- The system was fully implemented on the main branch before this specification effort
- All core features (document viewing, upload, editing, search, document type management) are operational

### Existing Implementation
The codebase contains:
- **227 files** with **24,001 lines of code** across frontend components, API clients, and utilities
- **Next.js 14** application with TypeScript, Material-UI, and Auth0 integration
- **Comprehensive component library** with reusable UI components
- **API integration** with TemplatelessApiV2 for document processing
- **State management** via Zustand stores
- **Internationalization** support for English and Japanese

## Technology Decisions

### Decision 1: React Framework - Next.js 14 with App Router

**Chosen**: Next.js 14.2.15 with App Router architecture

**Rationale**:
- Server-side rendering (SSR) for improved SEO and initial page load performance
- Built-in routing with file-based system in `app/` directory
- API routes for server-side logic (though not heavily used in this project)
- Optimized for static generation and server components
- Strong TypeScript support and type safety
- Large ecosystem and community support
- Vercel deployment integration

**Alternatives Considered**:
- **Create React App (CRA)**: Rejected due to lack of built-in SSR and routing
- **Vite + React**: Rejected due to less opinionated structure, would need to add routing manually
- **React Router + Express**: Rejected due to increased complexity and maintenance burden

**Implementation**: All pages in `src/app/` directory using App Router pattern with `page.tsx` files

---

### Decision 2: UI Component Library - Material-UI (MUI) v6

**Chosen**: Material-UI 6.1.4 with Pro extensions (@mui/x-data-grid-pro, @mui/x-date-pickers-pro)

**Rationale**:
- Comprehensive component library with 40+ components out of the box
- Professional, enterprise-grade design system
- Strong TypeScript support with proper type definitions
- Theming system for consistent styling
- Data Grid Pro for advanced table features (sorting, filtering, pagination)
- Date Pickers Pro for date range selection
- Active development and maintenance
- Extensive documentation and examples

**Alternatives Considered**:
- **Ant Design**: Rejected due to less TypeScript support and heavier bundle size
- **Chakra UI**: Rejected due to smaller component ecosystem
- **Tailwind CSS**: Rejected due to need to build all components from scratch

**Implementation**:
- All components use MUI primitives (Box, Container, Typography, etc.)
- Custom components styled with `@mui/styled` for consistency
- Pro components for data grids and date pickers
- Emotion cache integration for server-side rendering

---

### Decision 3: State Management - Zustand

**Chosen**: Zustand 5.0.0 for global state management

**Rationale**:
- Simple API with minimal boilerplate
- No Context Provider overhead
- TypeScript-first design with excellent type inference
- Small bundle size (~1KB)
- Easy to test and debug
- Supports middleware (persist, devtools)
- No wrapper components needed

**Alternatives Considered**:
- **Redux Toolkit**: Rejected due to over-engineering for this app's state needs
- **React Context**: Rejected due to performance issues with frequent updates and re-renders
- **Jotai**: Rejected due to less familiar API and smaller community

**Implementation**:
- `global-data-store-provider.tsx`: Search filters, pagination, sorting state
- `document-data-store-provider.tsx`: Document-specific state
- `document-type-store-provider.tsx`: Document type management state
- Stores use Zustand's create() function with TypeScript generics

---

### Decision 4: PDF Rendering - PDF.js (pdfjs-dist)

**Chosen**: PDF.js 3.4.120 via pdfjs-dist package

**Rationale**:
- Mozilla-maintained, battle-tested library
- Excellent rendering quality and fidelity
- Supports text selection, annotations, and forms
- Canvas-based rendering for performance
- Page-by-page loading for large documents
- Web worker support for non-blocking rendering
- Strong browser compatibility

**Alternatives Considered**:
- **React-PDF**: Rejected as it's just a wrapper around PDF.js with less control
- **PDFRenderNet**: Rejected due to commercial licensing costs
- **Custom PDF rendering**: Rejected due to extreme complexity

**Implementation**:
- Integrated via `@netsmile/page-edit-component` which wraps PDF.js
- Page-by-page loading with thumbnail generation
- Zoom controls and page navigation
- Canvas-based rendering in DocumentViewer component

---

### Decision 5: Authentication - Auth0 Next.js SDK

**Chosen**: Auth0 3.5.0 with @auth0/nextjs-auth0

**Rationale**:
- Industry-standard authentication provider
- OAuth 2.0 and OpenID Connect support
- Next.js SDK with App Router integration
- Built-in user management and profile handling
- Social login support (Google, etc.)
- Secure token handling and refresh
- Multi-factor authentication support
- Organization and role-based access control

**Alternatives Considered**:
- **NextAuth.js**: Rejected due to more setup required for OAuth providers
- **Custom OAuth implementation**: Rejected due to security risks and maintenance burden
- **Firebase Auth**: Rejected due to vendor lock-in

**Implementation**:
- `withPageAuthRequired()` HOC on all pages
- Session management via Auth0 hooks
- User profile data stored in global state
- Token management via getServerApiClient() for server-side calls

---

### Decision 6: Internationalization - next-intl

**Chosen**: next-intl 3.22.0 for i18n support

**Rationale**:
- Built for Next.js App Router
- TypeScript support for translation keys
- Server-side and client-side component support
- Simple API with useTranslations() hook
- Locale-specific routing (e.g., /en/document, /ja/document)
- Date/number formatting with locale awareness
- Pluralization support

**Alternatives Considered**:
- **react-i18next**: Rejected due to more complex setup and less Next.js integration
- **FormatJS (React Intl)**: Rejected due to larger bundle size
- **Custom i18n solution**: Rejected due to reinventing the wheel

**Implementation**:
- English and Japanese locales configured
- Translation files in `messages/` directory
- useTranslations() hook in components
- Locale switching via user preferences

---

### Decision 7: API Integration - Custom REST Client

**Chosen**: Custom REST client with TypeScript types

**Rationale**:
- Full control over request/response handling
- Type-safe API calls with TypeScript interfaces
- Custom error types for different failure scenarios
- Bearer token authentication integration
- File upload support with FormData
- Abort controller support for request cancellation
- No external dependencies beyond fetch

**Alternatives Considered**:
- **axios**: Rejected due to larger bundle size and unneeded features
- **fetch API directly**: Rejected due to repetitive code without wrapper
- **tRPC**: Rejected due to backend not being under our control

**Implementation**:
- `TemplatelessApiV2Client.ts`: Main API client for document operations
- `UserServiceApiClient.ts`: User management API client
- Custom error classes (ApiCallError, NotFoundError, etc.)
- Utility functions for search pagination (iterateSearchPages)
- Bearer token injection via baseHeaders getter

---

### Decision 8: Testing - Jest and React Testing Library

**Chosen**: Jest 29.7.0 + React Testing Library 16.0.1

**Rationale**:
- Jest as test runner with built-in assertions and mocking
- React Testing Library for component testing (user-centric approach)
- jsdom environment for DOM simulation
- Co-located test files with `.test.tsx` suffix
- Coverage reporting support
- Watch mode for development

**Alternatives Considered**:
- **Vitest**: Rejected due to less maturity in Jest transition
- **Mocha + Chai**: Rejected due to more setup required
- **Cypress**: Rejected for E2E testing (not needed for unit/integration tests)

**Implementation**:
- Tests co-located with components
- `.test.tsx` suffix for test files
- describe/it/test structure for readability
- Testing Library queries (getBy, findBy, queryBy)
- Mock API responses for isolation
- Snapshot testing for component regression

---

### Decision 9: Code Quality - ESLint + Prettier + Husky

**Chosen**: ESLint (Airbnb config) + Prettier + Husky pre-commit hooks

**Rationale**:
- **ESLint**: Static analysis for code quality and consistency
- **Airbnb config**: Industry-standard style guide
- **TypeScript ESLint**: Type-aware linting rules
- **Prettier**: Automatic code formatting for consistency
- **Husky**: Git hooks for pre-commit quality gates
- **lint-staged**: Run linter/formatter only on changed files

**Alternatives Considered**:
- **Standard.js**: Rejected due to less TypeScript support
- **Biome**: Rejected due to being newer and less mature
- **No linting**: Rejected due to code quality risks

**Implementation**:
- ESLint config in `.eslintrc`
- Prettier config in `.prettierrc`
- Husky hooks in `.husky/`
- Pre-commit command: `lint-staged` runs prettier
- Pre-push command (optional): Full lint, test, typecheck, build

---

### Decision 10: Type Safety - TypeScript Strict Mode

**Chosen**: TypeScript 5.6 with strict mode enabled

**Rationale**:
- Catch type errors at compile time
- Better IDE autocomplete and IntelliSense
- Self-documenting code with type definitions
- Refactoring safety with type checking
- Shared types between frontend and API contracts
- Null safety with strict null checks

**Alternatives Considered**:
- **JavaScript with JSDoc**: Rejected due to weaker type checking
- **Flow**: Rejected due to smaller community and tooling
- **Loose TypeScript**: Rejected due to missing safety benefits

**Implementation**:
- `tsconfig.json` with `"strict": true`
- Type definitions in `src/types/` directory
- API types imported from `@nstypes/templateless`
- No `any` types without explicit comments
- Type exports for public interfaces

---

### Decision 11: File Upload - react-dropzone

**Chosen**: react-dropzone 14.2.10 for drag-and-drop file uploads

**Rationale**:
- Simple API for drag-and-drop functionality
- File type validation
- Progress tracking support
- Accessible keyboard navigation
- Touch-friendly for mobile devices
- Lightweight wrapper around HTML5 drag-and-drop API

**Alternatives Considered**:
- **Custom drag-and-drop**: Rejected due to complexity and edge cases
- **react-dropzone-uploader**: Rejected due to less flexibility
- **File input only**: Rejected due to poor UX

**Implementation**:
- DocumentUploadDialog component with Dropzone
- PDF file validation
- Document type selection before upload
- Progress indicator during upload

---

### Decision 12: Data Grid - MUI X Data Grid Pro

**Chosen**: @mui/x-data-grid-pro 6.20.4 for advanced table features

**Rationale**:
- Built-in sorting, filtering, pagination
- Virtual scrolling for performance
- Column resizing and reordering
- Export functionality
- Row selection (checkboxes)
- Custom cell renderers
- Accessibility support

**Alternatives Considered**:
- **react-table**: Rejected due to more manual implementation required
- **AG Grid**: Rejected due to larger bundle size and commercial licensing
- **Material-UI Table**: Rejected due to lacking advanced features

**Implementation**:
- DocumentTable and DocumentTypeTable components
- Server-side sorting and filtering
- Pagination with customizable page size
- Status icons and action buttons in columns
- Column definitions with type specifications

---

### Decision 13: Date Handling - Luxon

**Chosen**: Luxon 3.5.0 for date manipulation and formatting

**Rationale**:
- Immutable date objects (prevents bugs)
- Chainable API for transformations
- Timezone and locale support
- Lightweight compared to Moment.js
- TypeScript support
- Parsing and formatting capabilities

**Alternatives Considered**:
- **Moment.js**: Rejected due to being legacy and mutable
- **date-fns**: Rejected due to functional API being less intuitive
- **Native Date**: Rejected due to complexity and poor API

**Implementation**:
- Date range filtering in document search
- MUI X Date Pickers Pro integration
- AdapterLuxon for date picker components
- Locale-specific formatting for i18n

---

## Architectural Patterns

### Pattern 1: Component Composition

**Chosen**: Functional components with hooks and composition

**Rationale**:
- React 18+ best practices
- Hooks for state and side effects
- Composition over inheritance
- Reusable component library
- Easier to test and maintain

**Implementation**:
- All components are functional with TypeScript
- Custom hooks for shared logic
- Compound components (e.g., DocumentHeader + DocumentNavigation)
- Props interfaces for type safety

---

### Pattern 2: API Client Layer

**Chosen**: Centralized API client with error handling

**Rationale**:
- Single source of truth for API calls
- Consistent error handling
- Type-safe request/response
- Token management
- Request cancellation support

**Implementation**:
- `TemplatelessApiV2Client` class with methods for each endpoint
- Custom error types for different HTTP status codes
- `getApiClient()` for client-side, `getServerApiClient()` for server-side
- Abort controllers for cancelling in-flight requests

---

### Pattern 3: State Management

**Chosen**: Zustand for global state, React state for local state

**Rationale**:
- Global state for cross-component data (filters, user info)
- Local state (useState) for component-specific data
- Optimized re-renders via selector-based subscriptions
- No prop drilling for shared state

**Implementation**:
- Global store: search filters, pagination, user info
- Document state: current document data
- Local state: form inputs, modal open/close, UI toggles

---

### Pattern 4: Routing

**Chosen**: Next.js App Router with file-based routing

**Rationale**:
- Convention over configuration
- Server components by default
- Dynamic routes with `[id]` segments
- Layouts for shared UI (header, sidebar)
- Loading and error states

**Implementation**:
- `/document` - Document list page
- `/document/[id]` - Document detail page
- `/document-type` - Document type list
- `/document-type/[id]` - Document type detail
- Root layout with header and sidebar

---

### Pattern 5: Error Handling

**Chosen**: Error boundaries + Toast notifications + Custom error types

**Rationale**:
- Graceful degradation instead of crashes
- User-friendly error messages
- Detailed logging for debugging
- Different error pages for different scenarios

**Implementation**:
- ErrorPage component with variants (404, 403, ConnectionError, GeneralError)
- Snackbar notifications (notistack) for API errors
- Custom error classes (ApiCallError, NotFoundError, etc.)
- try-catch blocks in API calls with error logging

---

## Performance Optimizations

### Optimization 1: Code Splitting and Lazy Loading

**Implementation**:
- Next.js automatic code splitting by route
- Dynamic imports for heavy components
- PDF.js loaded on-demand when viewing documents

---

### Optimization 2: Pagination and Virtualization

**Implementation**:
- MUI X Data Grid Pro with virtual scrolling
- Server-side pagination for large datasets
- Page size customization (10, 25, 50, 100 items)

---

### Optimization 3: Caching

**Implementation**:
- Zustand store caches search results by page
- Page navigation reuses cached data
- Cache invalidated on filter/sort changes

---

### Optimization 4: Image Optimization

**Implementation**:
- Next.js Image component for logos and static images
- Lazy loading for below-the-fold images
- Responsive images with srcset

---

## Security Considerations

### Security 1: Authentication

**Implementation**:
- Auth0 OAuth 2.0 integration
- Bearer token stored securely in httpOnly cookie
- Token refresh on expiry
- Protected routes with `withPageAuthRequired()` HOC

---

### Security 2: Authorization

**Implementation**:
- User permissions checked on backend
- Role-based access control via Auth0
- Organization-level data isolation
- UI elements hidden based on permissions

---

### Security 3: Input Validation

**Implementation**:
- File type validation for uploads (PDF only)
- File size limits on upload
- Form validation with MUI TextField and ValidateField components
- XSS protection via React's default escaping

---

## Accessibility

### Accessibility 1: Keyboard Navigation

**Implementation**:
- All interactive elements keyboard-accessible
- Focus management in modals
- Skip links for main content
- Tab order follows visual flow

---

### Accessibility 2: Screen Reader Support

**Implementation**:
- ARIA labels on interactive elements
- Semantic HTML (nav, main, article, etc.)
- Alt text for images
- Error messages announced to screen readers

---

### Accessibility 3: Visual Accessibility

**Implementation**:
- MUI's built-in accessibility features
- High contrast mode support
- Text scaling support
- Color not the only indicator (icons + text)

---

## Summary

All architectural decisions have been made and implemented in the existing codebase. The system follows React and Next.js best practices with:
- Modern tooling (TypeScript, ESLint, Prettier)
- Industry-standard libraries (Material-UI, Auth0, PDF.js)
- Performance optimizations (pagination, caching, code splitting)
- Security best practices (authentication, authorization, input validation)
- Accessibility support (keyboard, screen readers, visual)
- Comprehensive testing setup (Jest, React Testing Library)

No additional research or technology selection is needed for this documentation effort.
