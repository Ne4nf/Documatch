'use client';

import type { Prompt } from '@nstypes/templateless';
import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import type {
  DocumentTableSortColumns,
  TableSortDirection,
} from '@/components/DocumentList/types';
import type { PromptSearchResults } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import type { User } from '@/services/api/UserServiceApi/UserServiceApiClient';
import {
  createDocumentTypeStore,
  type DocumentTypeState,
  type DocumentTypeStore,
} from '@/stores/document-type-store';

export type DocumentTypeStoreApi = ReturnType<typeof createDocumentTypeStore>;

export const DocumentTypeStoreContext = createContext<DocumentTypeStoreApi | undefined>(
  undefined,
);
export interface DocumentTypeStoreProviderProps {
  children: ReactNode;
  firstDocumentTypePage: PromptSearchResults | undefined;
  presetPrompts: Prompt[];
  users: User[];
}

export function DocumentTypeStoreProvider({
  children,
  firstDocumentTypePage,
  presetPrompts,
  users,
}: DocumentTypeStoreProviderProps) {
  const page = 0;
  const rowsPerPage = 10;
  const sortColumn: DocumentTableSortColumns = 'updatedAt';
  const sortDirection: TableSortDirection = 'desc';
  const searchResults: PromptSearchResults[] = (() => {
    if (!firstDocumentTypePage) {
      return [];
    }
    const { total } = firstDocumentTypePage;
    const totalPages = Math.max(Math.ceil(total / rowsPerPage), 1);
    const ret: PromptSearchResults[] = Array(totalPages).fill(null);
    ret[0] = firstDocumentTypePage;
    return ret;
  })();
  const initialState: DocumentTypeState = {
    documentTypeSearchFilters: {
      createdAtDateRange: [null, null],
      createdBy: null,
      documentTypeName: null,
      updatedAtDateRange: [null, null],
    },
    page,
    presetPrompts,
    rowsPerPage,
    searchResults,
    sortColumn,
    sortDirection,
    users,
  };
  const storeRef = useRef<DocumentTypeStoreApi>();

  if (!storeRef.current) {
    storeRef.current = createDocumentTypeStore(initialState);
  }

  return (
    <DocumentTypeStoreContext.Provider value={storeRef.current}>
      {children}
    </DocumentTypeStoreContext.Provider>
  );
}

export const useDocumentTypeStore = <T,>(
  selector: (store: DocumentTypeStore) => T,
): T => {
  const documentTypeStoreContext = useContext(DocumentTypeStoreContext);

  if (!documentTypeStoreContext) {
    throw new Error('useDocumentTypeStore must be used within DocumentTypeStoreProvider');
  }
  return useStore(documentTypeStoreContext, selector);
};
