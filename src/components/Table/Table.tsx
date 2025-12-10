'use client';

import CircularProgress from '@mui/material/CircularProgress';
import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { Spinner } from '@/components/Loaders';
import { SIZES } from '@/constants';
import { useWindowSize } from '@/hooks';

import TableSortLabel from './TableSortLabel';

export interface ColumnItemProps {
  align?: 'center' | 'inherit' | 'justify' | 'left' | 'right';
  cellSx?: object;
  headerCellSx?: object;
  id: string;
  label: string;
  minWidth?: number;
  render?: (row: RowItemProps) => void;
  sortable?: boolean;
  sortName?: string;
}

export interface RowItemProps {
  [key: string]: any;
}

interface TableProps {
  columns: Array<ColumnItemProps>;
  id: string;
  loading?: boolean;
  onSortingChange?: (column: ColumnItemProps) => void;
  rows: Array<RowItemProps>;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

function Table({
  columns,
  id,
  loading = false,
  onSortingChange = () => {},
  rows,
  sortColumn,
  sortDirection,
}: TableProps) {
  const windowSize = useWindowSize();

  if (!windowSize.width || !windowSize.height) {
    return <Spinner />;
  }

  // TODO: This height is the combined vertical space in the main page layout
  // (excluding header and footer) that is taken up by elements other than the table
  // It depends on padding etc. for the surrounding components, and ideally it should
  // be calculated dynamically
  const RESERVED_HEIGHT = 394;
  const LOADING_TABLE_HEIGHT = 300;

  // The table should expand vertically to fill the entire screen height
  const maxHeight = Math.max(
    windowSize.height - SIZES.HEADER_HEIGHT - SIZES.FOOTER_HEIGHT - RESERVED_HEIGHT,
    200,
  );

  return (
    <TableContainer id={id} sx={{ maxHeight }}>
      <MuiTable aria-label="sticky table" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map(column => (
              <TableCell
                align={column.align}
                key={column.id}
                sx={{
                  '&:first-of-type': {
                    borderLeftWidth: 0,
                  },
                  '&:last-child': {
                    borderRightWidth: 0,
                  },
                  bgcolor: 'primary.main',
                  borderColor: 'common.white',
                  borderLeft: '2px solid',
                  borderRight: '2px solid',
                  color: 'common.white',
                  fontSize: '15px',
                  fontWeight: 'medium',
                  minWidth: column.minWidth,
                  ...column.headerCellSx,
                }}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={sortColumn === column.sortName}
                    direction={sortColumn === column.sortName ? sortDirection : 'asc'}
                    onClick={() => onSortingChange(column)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow sx={{ height: LOADING_TABLE_HEIGHT }}>
              <TableCell align="center" colSpan={columns.length}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => {
              return (
                <TableRow hover key={row?.id} role="checkbox" tabIndex={-1}>
                  {columns.map(column => {
                    return (
                      <TableCell
                        align={column.align}
                        key={column.id}
                        sx={{ color: 'common.black', ...column.cellSx }}
                      >
                        {column.render ? column.render(row) : row[column.id]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}

export default Table;
