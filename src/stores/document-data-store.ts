import { createStore } from 'zustand/vanilla';

import { getApiClient } from '@/services/api';

export type DocumentDataActions = {
  updateDocument: (documentId: string) => Promise<void>;
};

export type DocumentDataState = {
  // TODO - ALO-210 - use 'any' type temporarily until pageGroups added to RawDocument.
  rawDocument: any;
};

export type DocumentDataStore = DocumentDataActions & DocumentDataState;

export const createDocumentDataStore = (initState: DocumentDataState) => {
  return createStore<DocumentDataStore>()(set => ({
    ...initState,
    updateDocument: async (documentId: string) => {
      try {
        const apiClient = getApiClient();
        const res = await apiClient.getDocument(documentId);
        set({ rawDocument: res });
      } catch (e) {
        console.error('Error updating document', e);
      }
    },
  }));
};
