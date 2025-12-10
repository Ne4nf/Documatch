'use client';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import type { SelectChangeEvent } from '@mui/material';
import { Box, MenuItem, Select, styled, Typography } from '@mui/material';
import * as React from 'react';

const PaginationContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '8px',
}));

const RowsPerPageContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '8px',
}));

const PagesContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
}));

const Page = styled('button')(() => ({
  alignItems: 'center',
  backgroundColor: 'white',
  border: 'none',
  color: '#797979',
  cursor: 'pointer',
  display: 'flex',
  fontSize: '14px',
  fontWeight: 500,
  height: '36px',
  justifyContent: 'center',
  lineHeight: '22px',
  padding: '0',
  width: '36px',
}));

type DocumentTypeTablePaginationProps = {
  count: number;
  onPageChange: (event: null | React.MouseEvent<HTMLButtonElement>, page: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent) => void;
  page: number;
  rowPerPageLabel: string;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
};

type MiddlePagesProps = {
  count: number;
  onPageChange: (event: null | React.MouseEvent<HTMLButtonElement>, page: number) => void;
  page: number;
  rowsPerPage: number;
};

export default function DocumentTypeTablePagination({
  count,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowPerPageLabel,
  rowsPerPage,
  rowsPerPageOptions,
}: DocumentTypeTablePaginationProps) {
  return (
    <PaginationContainer>
      <RowsPerPageContainer>
        <Typography color="#797979" fontSize="14px" fontWeight={500} lineHeight="22px">
          {rowPerPageLabel}
        </Typography>

        <Select
          defaultValue={rowsPerPageOptions ? rowsPerPageOptions[0]?.toString() : '10'}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          onChange={onRowsPerPageChange}
          sx={{
            '& .MuiInputBase-input': {
              color: '#242222',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '22px',
            },
            '& .MuiSelect-icon': {
              color: '#323232',
            },
            borderRadius: '2px',
            height: '40px',
            width: '74px',
          }}
        >
          {(rowsPerPageOptions || []).map((item: number) => (
            <MenuItem key={item.toString()} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </RowsPerPageContainer>

      <PagesContainer>
        <Page
          onClick={event => {
            if (page > 0) {
              onPageChange(event, page - 1);
            }
          }}
        >
          <ArrowLeftIcon sx={{ color: '#757575' }} />
        </Page>

        <MiddlePages
          count={count}
          onPageChange={onPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
        />

        <Page
          onClick={event => {
            if (page < Math.ceil(count / rowsPerPage - 1)) {
              onPageChange(event, page + 1);
            }
          }}
        >
          <ArrowRightIcon sx={{ color: '#757575' }} />
        </Page>
      </PagesContainer>
    </PaginationContainer>
  );
}

function MiddlePages({ count, onPageChange, page, rowsPerPage }: MiddlePagesProps) {
  if (!count) {
    return <Page sx={page === 0 ? { backgroundColor: '#EFFAFF' } : {}}>1</Page>;
  }

  if (Math.ceil(count / rowsPerPage) <= 5) {
    return (
      <PagesContainer>
        {Array.from(Array(Math.ceil(count / rowsPerPage)).keys()).map((item: number) => (
          <Page
            key={item}
            onClick={event => onPageChange(event, item)}
            sx={page === item ? { backgroundColor: '#EFFAFF' } : {}}
          >
            {item + 1}
          </Page>
        ))}
      </PagesContainer>
    );
  }

  const pageMax = Math.ceil(count / rowsPerPage);
  let middlePages = [];

  if (page === 0 || page === 1) {
    middlePages = [2, 3, 4];
  } else if (page === pageMax - 1 || page === pageMax - 2) {
    middlePages = [pageMax - 3, pageMax - 2, pageMax - 1];
  } else {
    middlePages = [page, page + 1, page + 2];
  }

  return (
    <PagesContainer>
      <Page
        onClick={event => onPageChange(event, 0)}
        sx={page === 0 ? { backgroundColor: '#EFFAFF' } : {}}
      >
        1
      </Page>

      {page > 2 && <Page sx={{ cursor: 'default' }}>...</Page>}

      {middlePages.map((item: number) => {
        if (item < pageMax && item > 1) {
          return (
            <Page
              key={item}
              onClick={event => onPageChange(event, item - 1)}
              sx={page === item - 1 ? { backgroundColor: '#EFFAFF' } : {}}
            >
              {item}
            </Page>
          );
        }
        return null;
      })}

      {page < pageMax - 3 && <Page sx={{ cursor: 'default' }}>...</Page>}

      <Page
        onClick={event => onPageChange(event, pageMax - 1)}
        sx={page === pageMax - 1 ? { backgroundColor: '#EFFAFF' } : {}}
      >
        {pageMax}
      </Page>
    </PagesContainer>
  );
}
