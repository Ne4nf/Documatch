import type { Definition, Prompt } from '@nstypes/templateless';
import { createStore } from 'zustand/vanilla';

import type {
  DocumentTableSortColumns,
  TableSortDirection,
} from '@/components/DocumentList/types';
import type { DocumentSearchResults } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import type {
  OrganizationOptions,
  User,
  UserInfo,
} from '@/services/api/UserServiceApi/UserServiceApiClient';
import type { SearchFilters } from '@/types';

export type GlobalDataActions = {
  resetSearchResults: (newFirstPage: DocumentSearchResults) => void;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  setSearchFilters: (searchFilters: SearchFilters) => void;
  setSearchResults: (page: number, result: DocumentSearchResults) => void;
  setSortColumn: (sortColumn: DocumentTableSortColumns) => void;
  setSortDirection: (sortDirection: TableSortDirection) => void;
};

export type GlobalDataState = {
  definitions: Definition[];
  organizationOptions: OrganizationOptions;
  page: number;
  prompts: Prompt[];
  rowsPerPage: number;
  searchFilters: SearchFilters;
  searchResults: DocumentSearchResults[];
  sortColumn: DocumentTableSortColumns;
  sortDirection: TableSortDirection;
  userInfo: UserInfo;
  users: User[];
};

export type GlobalDataStore = GlobalDataActions & GlobalDataState;

export const createGlobalDataStore = (initState: GlobalDataState) => {
  return createStore<GlobalDataStore>()(set => ({
    ...initState,
    resetSearchResults: (newFirstPage: DocumentSearchResults) =>
      set(state => {
        const { total } = newFirstPage;
        const totalPages = Math.max(Math.ceil(total / state.rowsPerPage), 1);

        const ret: DocumentSearchResults[] = Array(totalPages).fill(null);
        ret[0] = newFirstPage;
        return {
          page: 0,
          searchResults: ret,
        };
      }),
    setPage: (page: number) => set(() => ({ page })),
    setRowsPerPage: (rowsPerPage: number) => set(() => ({ rowsPerPage })),
    setSearchFilters: (searchFilters: SearchFilters) => set(() => ({ searchFilters })),
    setSearchResults: (page: number, result: DocumentSearchResults) =>
      set(state => {
        const newSearchResults = [...state.searchResults];
        newSearchResults[page - 1] = result;
        return { searchResults: newSearchResults };
      }),
    setSortColumn: (sortColumn: DocumentTableSortColumns) => set(() => ({ sortColumn })),
    setSortDirection: (sortDirection: TableSortDirection) =>
      set(() => ({ sortDirection })),
  }));
};
