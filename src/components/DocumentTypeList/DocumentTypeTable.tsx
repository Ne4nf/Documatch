'use client';

import type { SelectChangeEvent } from '@mui/material';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import Link from '@/components/Link';
import { DATE_FORMATS, PAGINATION_OPTIONS } from '@/constants';
import type { User } from '@/services/api/UserServiceApi/UserServiceApiClient';
import { formatDate } from '@/utils';

import type { ColumnItemProps } from '../DocumentTypeForm/FieldView';
import FieldView from '../DocumentTypeForm/FieldView';
import DocumentTypeTablePagination from './DocumentTypeTablePagination';
import type { DocumentTypeTableSortColumns, TableSortDirection } from './types';

interface DocumentTypeTableProps {
  data: any;
  isLoading: boolean;
  onPageChange: (event: null | React.MouseEvent, newPage: number) => Promise<void>;
  onRowsPerPageChange: (event: SelectChangeEvent) => Promise<void>;
  onSortingChange: (column: ColumnItemProps) => Promise<void>;
  page: number;
  rowsPerPage: number;
  sortColumn: DocumentTypeTableSortColumns;
  sortDirection: TableSortDirection;
  users: User[];
}

function DocumentTypeTable(props: DocumentTypeTableProps) {
  const tDocumentType = useTranslations('DocumentTypeList');

  const {
    data,
    onPageChange,
    onRowsPerPageChange,
    onSortingChange,
    page,
    rowsPerPage,
    sortColumn,
    sortDirection,
    users,
  } = props;
  const { results, total } = data;

  const userIdToNameMap = new Map<string, string>();
  users.forEach(user => userIdToNameMap.set(user.id?.toString(), user.name));
  userIdToNameMap.set('-1', tDocumentType('system'));

  const columns: ColumnItemProps[] = [
    {
      align: 'left',
      headerCellSx: {
        width: '120px',
      },
      id: 'id',
      label: tDocumentType('id'),
      render: row => <Link href={`/document-type/${row.id}`}>{row.id}</Link>,
    },
    {
      align: 'left',
      id: 'name',
      label: tDocumentType('name'),
      render: row => <Link href={`/document-type/${row.id}`}>{row.name}</Link>,
      sortable: true,
      sortName: 'name',
    },
    {
      align: 'left',
      headerCellSx: {
        width: '200px',
      },
      id: 'createdBy',
      label: tDocumentType('createdBy'),
      render: (row: any) => {
        return (
          userIdToNameMap.get(row.createdBy === null ? '-1' : row.createdBy.toString()) ??
          row.createdBy
        );
      },
      sortable: true,
      sortName: 'createdBy',
    },
    {
      align: 'left',
      headerCellSx: {
        width: '140px',
      },
      id: 'createdAt',
      label: tDocumentType('createdAt'),
      render: (row: any) => formatDate(row.createdAt, DATE_FORMATS.DATE),
      sortable: true,
      sortName: 'createdAt',
    },
    {
      align: 'left',
      headerCellSx: {
        width: '140px',
      },
      id: 'updatedAt',
      label: tDocumentType('updatedAt'),
      render: (row: any) => formatDate(row.updatedAt, DATE_FORMATS.DATE),
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
          margin: '32px 0 8px',
        }}
      >
        <Typography color="#000000" fontSize="16px" fontWeight={500} lineHeight="24px">
          {total}
          {tDocumentType('results')}
        </Typography>
      </Box>
      <FieldView
        columns={columns}
        id="document_type_table"
        loading={props.isLoading}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSortingChange={onSortingChange}
        rows={results || []}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />

      <DocumentTypeTablePagination
        count={total}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onPageChange={onPageChange}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowPerPageLabel={tDocumentType('rowsPerPage')}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={PAGINATION_OPTIONS}
      />
    </Box>
  );
}
export default DocumentTypeTable;
export { DocumentTypeTable };
