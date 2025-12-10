'use client';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';

import Link from '@/components/Link';
import Table, {
  type ColumnItemProps,
  type RowItemProps,
  TablePagination,
} from '@/components/Table';
import {
  DONE_STATUSES,
  ERROR_STATUSES,
  PAGINATION_OPTIONS,
  PENDING_STATUSES,
} from '@/constants';
import { useGlobalDataStore } from '@/providers/global-data-store-provider';
import type { DocumentSearchResults } from '@/services/api/TemplatelessApiV2/TemplatelessApiV2Client';
import { formatDate } from '@/utils';

import type { DocumentTableSortColumns, TableSortDirection } from './types';

interface DocumentTableProps {
  data: DocumentSearchResults;
  isLoading: boolean;
  onPageChange: (event: null | React.MouseEvent, newPage: number) => Promise<void>;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSortingChange: (column: ColumnItemProps) => Promise<void>;
  page: number;
  rowsPerPage: number;
  sortColumn: DocumentTableSortColumns;
  sortDirection: TableSortDirection;
}

function DocumentTable(props: DocumentTableProps) {
  const { users } = useGlobalDataStore(state => state);

  const locale = useLocale();
  const t = useTranslations('DocumentList');

  const userIdToNameMap = new Map<string, string>();
  users.forEach(user => userIdToNameMap.set(user.id, user.name));
  userIdToNameMap.set('-1', t('system'));

  const {
    data,
    isLoading,
    onPageChange,
    onRowsPerPageChange,
    onSortingChange,
    page,
    rowsPerPage,
    sortColumn,
    sortDirection,
  } = props;

  const { results, total } = data;

  const columns: ColumnItemProps[] = [
    {
      align: 'left',
      id: 'id',
      label: t('id'),
      render: (row: any) => <Link href={`/document/${row.id}`}>{row.id}</Link>,
      sortable: true,
      sortName: 'id',
    },
    {
      align: 'left',
      id: 'name',
      label: t('documentName'),
      render: (row: any) => <Link href={`/document/${row.id}`}>{row.name}</Link>,
      sortable: true,
      sortName: 'name',
    },
    {
      align: 'left',
      // TODO: The special 'confirmed' flag should override the display of status here
      // we should add a tooltip to show the actual document status when the document
      // is confirmed
      // TODO: Consider to adding icons for the status
      // TODO: Some statuses may be useful to combine the display for the various
      // pending statuses into one, and show a tooltip with the actual status when
      // this happens. Create components for this.
      id: 'status',
      label: t('status'),
      render: (row: RowItemProps) => {
        if (row.confirmed) {
          return (
            <Tooltip title={row.status}>
              <Typography>{t('confirmed')}</Typography>
            </Tooltip>
          );
        }

        if (PENDING_STATUSES.includes(row.status)) {
          return (
            <Tooltip title={row.status}>
              <Typography>{t('processing')}</Typography>
            </Tooltip>
          );
        }

        if (DONE_STATUSES.includes(row.status)) {
          return (
            <Tooltip title={row.status}>
              <Typography>{t('done')}</Typography>
            </Tooltip>
          );
        }

        if (ERROR_STATUSES.includes(row.status)) {
          return (
            <Tooltip title={row.status}>
              <Typography>{t('error')}</Typography>
            </Tooltip>
          );
        }

        return row.status;
      },
      sortable: true,
      sortName: 'status',
    },
    {
      align: 'left',
      id: 'createdBy',
      label: t('createdBy'),
      render: (row: any) => {
        return userIdToNameMap.get(row.createdBy) ?? row.createdBy;
      },
      sortable: true,
      sortName: 'createdBy',
    },
    {
      align: 'left',
      id: 'createdAt',
      label: t('createdAt'),
      render: (row: any) => formatDate(row.createdAt),
      sortable: true,
      sortName: 'createdAt',
    },
    {
      align: 'left',
      id: 'updatedAt',
      label: t('lastUpdated'),
      render: (row: any) => formatDate(row.updatedAt),
      sortable: true,
      sortName: 'updatedAt',
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          component="div"
          noWrap
          sx={{
            fontSize: '20px',
            fontWeight: 'medium',
          }}
        >
          {`${total.toLocaleString(locale)} ${t('items')}`}
        </Typography>
        <TablePagination
          count={total}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPageChange={onPageChange}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={PAGINATION_OPTIONS}
        />
      </Box>
      <Table
        columns={columns}
        id="document_table"
        loading={isLoading}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSortingChange={onSortingChange}
        rows={results}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div />
        <TablePagination
          count={total}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPageChange={onPageChange}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={PAGINATION_OPTIONS}
        />
      </Box>
    </Box>
  );
}

export default DocumentTable;
export { DocumentTable };
