# Quickstart Guide: Document Management System

**Feature**: 001-document-management
**Date**: 2025-01-14
**Phase**: 1 - Design & Contracts

## Overview

This guide helps developers quickly understand and work with the Document Management System codebase. It covers setup, architecture, common tasks, and debugging tips.

## Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **Auth0 Account**: For authentication (or development credentials)
- **API Access**: TemplatelessApiV2 backend access

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd documatch

# Install dependencies
yarn install

# or with npm
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Auth0 Configuration
AUTH0_SECRET=<your-auth0-secret>
AUTH0_BASE_URL=http://localhost:3995
AUTH0_ISSUER_BASE_URL=https://<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/v2
API_SECRET_KEY=<your-api-secret>

# Feature Flags
NEXT_PUBLIC_HIDE_UPLOAD_UI=false
```

### 3. Run Development Server

```bash
# Start the development server
yarn dev

# or with npm
npm run dev

# Application will be available at:
# http://localhost:3995
```

### 4. Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test --coverage
```

### 5. Type Checking

```bash
# Run TypeScript compiler to check types
yarn typecheck

# or with npm
npm run typecheck
```

### 6. Linting and Formatting

```bash
# Run ESLint
yarn lint

# Format code with Prettier
yarn format

# Run pre-commit checks (lint + test + typecheck + build)
yarn prepr
```

## Project Architecture

### Directory Structure

```text
src/
├── app/                          # Next.js 14 App Router pages
│   ├── document/
│   │   ├── page.tsx             # Document list page
│   │   └── [id]/
│   │       └── page.tsx         # Document detail page
│   ├── document-type/
│   │   ├── page.tsx            # Document type list page
│   │   └── [id]/
│   │       └── page.tsx        # Document type detail page
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Home page
│
├── components/                   # React components
│   ├── Document/                # Document viewing/editing
│   │   ├── Document.tsx
│   │   ├── DocumentHeader/     # Navigation and actions
│   │   └── PropertiesEditPopover/  # Metadata editing
│   ├── DocumentList/            # Document list with filters
│   │   ├── DocumentList.tsx    # Main component
│   │   ├── DocumentTable.tsx   # Data grid table
│   │   └── DoumentFilters.tsx  # Filter controls
│   ├── DocumentUploadDialog/    # File upload dialog
│   ├── DocumentTypeList/        # Document type management
│   ├── DocumentTypeForm/        # Document type creation/editing
│   ├── ResultData/              # Extracted data display
│   │   ├── FieldView/          # Field values
│   │   └── TableView/          # Table data
│   ├── PageLayout/              # App shell
│   │   ├── Header/             # Top navigation
│   │   ├── Sidebar/            # Side navigation
│   │   └── Footer/             # Footer content
│   └── [Other UI components]
│
├── services/                     # API integration
│   └── api/
│       ├── TemplatelessApiV2/
│       │   └── TemplatelessApiV2Client.ts  # Main API client
│       ├── UserServiceApi/
│       │   └── UserServiceApiClient.ts     # User API client
│       ├── errors/                           # Custom error types
│       ├── types.ts                          # API types
│       └── utils.ts                          # API utilities
│
├── providers/                    # State management
│   ├── global-data-store-provider.tsx    # Global state
│   ├── document-data-store-provider.tsx  # Document state
│   └── document-type-store-provider.tsx  # Document type state
│
├── constants/                    # App constants
├── types/                        # TypeScript types
└── utils/                        # Utility functions
```

### Key Files to Understand

1. **src/app/layout.tsx**: Root layout with providers and authentication
2. **src/services/api/TemplatelessApiV2/TemplatelessApiV2Client.ts**: Main API client
3. **src/providers/global-data-store-provider.tsx**: Global state management
4. **src/components/DocumentList/DocumentList.tsx**: Document list implementation
5. **src/components/Document/Document.tsx**: Document viewer implementation

## Common Tasks

### Task 1: Add a New API Endpoint

**Step 1**: Add method to API client

```typescript
// src/services/api/TemplatelessApiV2/TemplatelessApiV2Client.ts

class TemplatelessApiV2Client {
  // ... existing methods

  async getMyNewEndpoint(id: string): Promise<MyNewResponseType> {
    const options: Options = {
      method: 'GET',
      headers: {
        ...this.baseHeaders,
        Accept: 'application/json',
      },
    };

    const response = await fetch(
      `${this.baseUrl}/my-new-endpoint/${id}`,
      options
    );

    await throwIfError(response);

    return response.json();
  }
}
```

**Step 2**: Add TypeScript types

```typescript
// src/services/api/types.ts

export interface MyNewResponseType {
  id: string;
  name: string;
  // ... other fields
}
```

**Step 3**: Use in component

```typescript
import { getApiClient } from '@/services/api';

const MyComponent = () => {
  const [data, setData] = useState<MyNewResponseType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiClient = getApiClient();
      const result = await apiClient.getMyNewEndpoint('id');
      setData(result);
    };
    fetchData();
  }, []);

  // ... render
};
```

---

### Task 2: Create a New Page

**Step 1**: Create page component

```typescript
// src/app/my-new-page/page.tsx

import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import type { NextPage } from 'next';
import * as React from 'react';

const MyNewPage: NextPage = withPageAuthRequired(
  async () => {
    return (
      <div>
        <h1>My New Page</h1>
        {/* Page content */}
      </div>
    );
  },
  { returnTo: '/my-new-page' }
);

export default MyNewPage;
```

**Step 2**: Add navigation link

```typescript
// src/components/PageLayout/Sidebar/Sidebar.tsx

<ListItemButton component={Link} to="/my-new-page">
  <ListItemText primary="My New Page" />
</ListItemButton>
```

---

### Task 3: Add a New Component

**Step 1**: Create component file

```typescript
// src/components/MyNewComponent/MyNewComponent.tsx

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as React from 'react';

interface MyNewComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyNewComponent: React.FC<MyNewComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {/* Component content */}
    </Box>
  );
};
```

**Step 2**: Create index file

```typescript
// src/components/MyNewComponent/index.ts

export { MyNewComponent } from './MyNewComponent';
```

**Step 3**: Add tests

```typescript
// src/components/MyNewComponent/MyNewComponent.test.tsx

import { render, screen } from '@testing-library/react';
import { MyNewComponent } from './MyNewComponent';

describe('MyNewComponent', () => {
  it('renders title', () => {
    render(<MyNewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

---

### Task 4: Add State to Global Store

**Step 1**: Update global store

```typescript
// src/providers/global-data-store-provider.tsx

interface GlobalDataStore {
  // ... existing state

  // Add new state
  myNewState: string | null;
  setMyNewState: (value: string | null) => void;
}

export const useGlobalDataStore = create<GlobalDataStore>((set) => ({
  // ... existing state

  // Add new state and setter
  myNewState: null,
  setMyNewState: (value) => set({ myNewState: value }),
}));
```

**Step 2**: Use in component

```typescript
import { useGlobalDataStore } from '@/providers/global-data-store-provider';

const MyComponent = () => {
  const { myNewState, setMyNewState } = useGlobalDataStore();

  return (
    <input
      value={myNewState || ''}
      onChange={(e) => setMyNewState(e.target.value)}
    />
  );
};
```

---

### Task 5: Add a New Filter to Document List

**Step 1**: Update SearchFilters type

```typescript
// src/types/index.ts

export interface SearchFilters {
  // ... existing filters
  myNewFilter?: string;
}
```

**Step 2**: Add filter UI

```typescript
// src/components/DocumentList/DoumentFilters.tsx

<TextField
  label="My New Filter"
  value={searchFilters.myNewFilter || ''}
  onChange={(e) =>
    setSearchFilters({
      ...searchFilters,
      myNewFilter: e.target.value,
    })
  }
/>
```

**Step 3**: Update API call

```typescript
// src/components/DocumentList/DocumentList.tsx

const filters = {
  // ... existing filters
  myNewFilter: searchFilters.myNewFilter,
};

const newData = await apiClient.searchDocuments(
  filters,
  sorting,
  newPage + 1,
  rowsPerPage
);
```

---

## Debugging Tips

### Tip 1: Check API Responses

Open browser DevTools Console and look for:

```javascript
console.log('API Response:', data);
```

Or use React DevTools to inspect Zustand store state.

---

### Tip 2: Debug API Calls

Add logging to API client:

```typescript
// src/services/api/TemplatelessApiV2/TemplatelessApiV2Client.ts

async searchDocuments(...) {
  console.log('Search filters:', filters);
  console.log('Sorting:', sorting);

  const response = await fetch(...);

  console.log('Response status:', response.status);
  console.log('Response data:', await response.clone().json());

  return response.json();
}
```

---

### Tip 3: Debug State Changes

Use Zustand devtools:

```typescript
// src/providers/global-data-store-provider.tsx

import { devtools } from 'zustand/middleware';

export const useGlobalDataStore = create<GlobalDataStore>()(
  devtools(
    (set) => ({
      // ... store definition
    }),
    { name: 'GlobalDataStore' }
  )
);
```

Then install Redux DevTools browser extension to inspect state changes.

---

### Tip 4: Debug Component Renders

Add React DevTools Profiler:

```bash
yarn add -D @react-devtools/inspector
```

Or use console logging:

```typescript
useEffect(() => {
  console.log('Component rendered:', { prop1, prop2 });
}, [prop1, prop2]);
```

---

### Tip 5: Check TypeScript Errors

Run type checker with detailed output:

```bash
yarn typecheck --pretty
```

Or use IDE integration (VSCode with TypeScript plugin).

---

## Testing Guide

### Unit Tests

Test individual components and functions:

```typescript
// src/components/MyComponent/MyComponent.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();

    render(<MyComponent title="Test" onAction={onAction} />);

    await user.click(screen.getByRole('button'));

    expect(onAction).toHaveBeenCalled();
  });
});
```

---

### Integration Tests

Test user flows across multiple components:

```typescript
// tests/integration/document-upload.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { DocumentList } from '@/components/DocumentList';

describe('Document Upload Flow', () => {
  it('uploads document and shows in list', async () => {
    render(<DocumentList />);

    // Click upload button
    await userEvent.click(screen.getByText('Upload'));

    // Fill upload form
    // ... (simulate file selection)

    // Submit form
    await userEvent.click(screen.getByText('Submit'));

    // Wait for document to appear in list
    await waitFor(() => {
      expect(screen.getByText('uploaded-file.pdf')).toBeInTheDocument();
    });
  });
});
```

---

### API Contract Tests

Test API client responses:

```typescript
// tests/contract/api-client.test.ts

import { TemplatelessApiV2Client } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';

describe('API Client', () => {
  it('fetches document by ID', async () => {
    const client = new TemplatelessApiV2Client({
      token: 'test-token',
      baseUrl: 'https://api.test.com',
    });

    const document = await client.getDocument('doc-id');

    expect(document).toHaveProperty('id');
    expect(document.id).toBe('doc-id');
  });
});
```

---

## Common Issues and Solutions

### Issue 1: "Module not found" Error

**Cause**: Incorrect import path or missing dependency

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
yarn install

# Check import path uses @ alias
import { MyComponent } from '@/components/MyComponent';  // ✓
import { MyComponent } from '../../../components/MyComponent';  // ✗
```

---

### Issue 2: "Auth0 Unauthorized" Error

**Cause**: Missing or expired Auth0 token

**Solution**:
```bash
# Check .env.local has correct Auth0 config
AUTH0_SECRET=<your-secret>
AUTH0_ISSUER_BASE_URL=https://<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<your-client-id>

# Restart dev server after changing .env.local
yarn dev
```

---

### Issue 3: API CORS Error

**Cause**: API server not configured for CORS

**Solution**: Add CORS headers to API server or configure proxy:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
};
```

---

### Issue 4: PDF Not Rendering

**Cause**: Missing PDF.js worker configuration

**Solution**:
```typescript
// src/app/layout.tsx

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
```

---

### Issue 5: Tests Failing with "Act Warnings"

**Cause**: Async state update not wrapped in act()

**Solution**:
```typescript
import { waitFor } from '@testing-library/react';

it('updates state', async () => {
  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

---

## Performance Optimization

### Optimization 1: Code Splitting

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Spinner />}>
  <HeavyComponent />
</Suspense>
```

---

### Optimization 2: Memoization

```typescript
import { memo } from 'react';

export const MyComponent = memo(({ prop1, prop2 }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.prop1 === nextProps.prop1;
});
```

---

### Optimization 3: Virtual Scrolling

```typescript
import { DataGridPro } from '@mui/x-data-grid-pro';

<DataGridPro
  rows={rows}
  columns={columns}
  pagination
  pageSizeOptions={[25, 50, 100]}
  virtualization
/>
```

---

## Deployment

### Build for Production

```bash
# Create production build
yarn build

# Test production build locally
yarn start

# Deploy to Vercel
vercel --prod
```

---

### Environment Variables for Production

Create `.env.production`:

```bash
AUTH0_SECRET=<production-secret>
AUTH0_BASE_URL=https://app.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/v2
```

---

## Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Material-UI Documentation**: https://mui.com
- **Auth0 Next.js SDK**: https://auth0.github.io/nextjs-auth0/
- **Zustand Documentation**: https://zustand-demo.pmnd.rs/
- **React Testing Library**: https://testing-library.com/react

---

## Getting Help

- **Check existing code**: Look at similar components for patterns
- **Read tests**: Tests serve as documentation for component behavior
- **Review API contracts**: See `contracts/api-contracts.md` for API details
- **Consult data model**: See `data-model.md` for entity relationships
- **Ask team**: Reach out in Slack or create a GitHub issue

---

**Happy Coding! 🚀**
