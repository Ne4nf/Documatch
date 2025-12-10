import FirstPage from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPage from '@mui/icons-material/LastPage';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type { TablePaginationProps } from '@mui/material/TablePagination';
import MuiTablePagination from '@mui/material/TablePagination';
import { useTranslations } from 'next-intl';
import * as React from 'react';

function ActionsComponent({
  count,
  onPageChange,
  page,
  rowsPerPage,
}: Pick<TablePaginationProps, 'count' | 'onPageChange' | 'page' | 'rowsPerPage'>) {
  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        aria-label="first page"
        disabled={page === 0}
        onClick={handleFirstPageButtonClick}
      >
        <FirstPage />
      </IconButton>
      <IconButton
        aria-label="previous page"
        disabled={page === 0}
        onClick={handleBackButtonClick}
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        aria-label="next page"
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        onClick={handleNextButtonClick}
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        aria-label="last page"
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        onClick={handleLastPageButtonClick}
      >
        <LastPage />
      </IconButton>
    </Box>
  );
}

function TablePagination({
  count,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  rowsPerPageOptions,
}: TablePaginationProps) {
  const t = useTranslations('TablePagination');

  const renderActionsComponent = () => {
    return (
      <ActionsComponent
        count={count}
        onPageChange={onPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
      />
    );
  };

  return (
    <MuiTablePagination
      ActionsComponent={renderActionsComponent}
      component="div"
      count={count}
      labelRowsPerPage={t('rowsPerPage')}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions || []}
      sx={{
        color: 'common.black',
      }}
    />
  );
}

export default TablePagination;
