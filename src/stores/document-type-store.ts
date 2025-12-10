import type { Prompt } from '@nstypes/templateless';
import { createStore } from 'zustand/vanilla';

import type {
  DocumentTypeTableSortColumns,
  TableSortDirection,
} from '@/components/DocumentTypeList/types';
import type { PromptSearchResults } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import type { User } from '@/services/api/UserServiceApi/UserServiceApiClient';
import type { DocumentTypeSearchFilters } from '@/types';

export type DocumentTypeActions = {
  resetSearchResults: (newFirstPage: PromptSearchResults) => void;
  setDocumentTypeSearchFilters: (
    documentTypeSearchFilters: DocumentTypeSearchFilters,
  ) => void;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  setSearchResults: (page: number, result: PromptSearchResults) => void;
  setSortColumn: (sortColumn: DocumentTypeTableSortColumns) => void;
  setSortDirection: (sortDirection: TableSortDirection) => void;
};

export type DocumentTypeState = {
  documentTypeSearchFilters: DocumentTypeSearchFilters;
  page: number;
  presetPrompts: Prompt[];
  rowsPerPage: number;
  searchResults: PromptSearchResults[];
  sortColumn: DocumentTypeTableSortColumns;
  sortDirection: TableSortDirection;
  users: User[];
};

export type DocumentTypeStore = DocumentTypeActions & DocumentTypeState;

export const createDocumentTypeStore = (initState: DocumentTypeState) => {
  return createStore<DocumentTypeStore>()(set => ({
    ...initState,
    resetSearchResults: (newFirstPage: PromptSearchResults) =>
      set(state => {
        const { total } = newFirstPage;
        const totalPages = Math.max(Math.ceil(total / state.rowsPerPage), 1);
        const ret: PromptSearchResults[] = Array(totalPages).fill(null);
        ret[0] = newFirstPage;
        return {
          page: 0,
          searchResults: ret,
        };
      }),
    setDocumentTypeSearchFilters: (
      documentTypeSearchFilters: DocumentTypeSearchFilters,
    ) => set(() => ({ documentTypeSearchFilters })),
    setPage: (page: number) => set(() => ({ page })),
    setRowsPerPage: (rowsPerPage: number) => set(() => ({ rowsPerPage })),
    setSearchResults: (page: number, result: PromptSearchResults) =>
      set(state => {
        const newSearchResults = [...state.searchResults];
        newSearchResults[page - 1] = result;
        return { searchResults: newSearchResults };
      }),
    setSortColumn: (sortColumn: DocumentTypeTableSortColumns) =>
      set(() => ({ sortColumn })),
    setSortDirection: (sortDirection: TableSortDirection) =>
      set(() => ({ sortDirection })),
  }));
};
