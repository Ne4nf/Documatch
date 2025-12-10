'use client';

import type { Definition, Prompt } from '@nstypes/templateless';
import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import { filterableDocumentStatuses } from '@/components/DocumentList';
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
import {
  createGlobalDataStore,
  type GlobalDataState,
  type GlobalDataStore,
} from '@/stores/global-data-store';

export type GlobalDataStoreApi = ReturnType<typeof createGlobalDataStore>;

export const GlobalDataStoreContext = createContext<GlobalDataStoreApi | undefined>(
  undefined,
);

export interface GlobalDataStoreProviderProps {
  children: ReactNode;
  definitions: Definition[];
  firstSearchResultsPage: DocumentSearchResults | undefined;
  organizationOptions: OrganizationOptions;
  prompts: Prompt[];
  userInfo: UserInfo;
  users: User[];
}

export function GlobalDataStoreProvider({
  children,
  definitions,
  firstSearchResultsPage,
  organizationOptions,
  prompts,
  userInfo,
  users,
}: GlobalDataStoreProviderProps) {
  const page = 0;
  const rowsPerPage = 10;
  const sortColumn: DocumentTableSortColumns = 'updatedAt';
  const sortDirection: TableSortDirection = 'desc';

  const searchResults: DocumentSearchResults[] = (() => {
    if (!firstSearchResultsPage) {
      return [];
    }

    const { total } = firstSearchResultsPage;
    const totalPages = Math.max(Math.ceil(total / rowsPerPage), 1);

    const ret: DocumentSearchResults[] = Array(totalPages).fill(null);
    ret[0] = firstSearchResultsPage;
    return ret;
  })();

  const initialState: GlobalDataState = {
    definitions,
    organizationOptions,
    page,
    prompts,
    rowsPerPage,
    searchFilters: {
      createdAtDateRange: [null, null],
      documentName: null,
      personInCharge: null,
      statuses: filterableDocumentStatuses.reduce(
        (acc, status) => ({ ...acc, [status]: false }),
        {} as { [key: string]: boolean },
      ),
      updatedAtDateRange: [null, null],
    },
    searchResults,
    sortColumn,
    sortDirection,
    userInfo,
    users,
  };

  const storeRef = useRef<GlobalDataStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createGlobalDataStore(initialState);
  }

  return (
    <GlobalDataStoreContext.Provider value={storeRef.current}>
      {children}
    </GlobalDataStoreContext.Provider>
  );
}

export const useGlobalDataStore = <T,>(selector: (store: GlobalDataStore) => T): T => {
  const globalDataStoreContext = useContext(GlobalDataStoreContext);

  if (!globalDataStoreContext) {
    throw new Error('useGlobalDataStore must be used within GlobalDataStoreProvider');
  }

  return useStore(globalDataStoreContext, selector);
};
