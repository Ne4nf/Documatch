'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import type { DocumentDataStore } from '@/stores/document-data-store';
import { createDocumentDataStore } from '@/stores/document-data-store';

export type DocumentDataStoreApi = ReturnType<typeof createDocumentDataStore>;

export const DocumentDataStoreContext = createContext<DocumentDataStoreApi | undefined>(
  undefined,
);

export interface DocumentDataStoreProviderProps {
  children: ReactNode;
  // TODO - ALO-210 - use 'any' type temporarily until pageGroups added to RawDocument.
  initialDocument: any;
}

export function DocumentDataStoreProvider({
  children,
  initialDocument,
}: DocumentDataStoreProviderProps) {
  const initialState = {
    rawDocument: initialDocument,
  };

  const storeRef = useRef<DocumentDataStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createDocumentDataStore(initialState);
  }

  return (
    <DocumentDataStoreContext.Provider value={storeRef.current}>
      {children}
    </DocumentDataStoreContext.Provider>
  );
}

export const useDocumentDataStore = <T,>(
  selector: (store: DocumentDataStore) => T,
): T => {
  const documentDataStoreContext = useContext(DocumentDataStoreContext);

  if (!documentDataStoreContext) {
    throw new Error('useDocumentDataStore must be used within DocumentDataStoreProvider');
  }

  return useStore(documentDataStoreContext, selector);
};
