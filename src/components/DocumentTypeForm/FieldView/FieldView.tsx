'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Spinner } from '@/components/Loaders';
import { SIZES } from '@/constants';
import { useWindowSize } from '@/hooks';

import { TableSortLabel } from '../../Table';
import FieldRow from './FieldRow';

export interface ColumnItemProps {
  align?: 'center' | 'inherit' | 'justify' | 'left' | 'right';
  cellSx?: object;
  edit?: boolean;
  headerCellSx?: object;
  id: string;
  label: React.ReactNode | string;
  minWidth?: number;
  render?: (row: RowItemProps, index: number) => void;
  sortable?: boolean;
  sortName?: string;
}

export interface FieldViewProps {
  actionButton?: {
    onClick?: (newData: any) => void;
    text: string;
  };
  columns: Array<ColumnItemProps>;
  createItem?: {
    isPreset?: boolean;
  };
  draggable?: boolean;
  id: string;
  isAdd?: boolean;
  isBorder?: boolean;
  isDelete?: boolean;
  isEdit?: boolean;
  loading?: boolean;
  onChange?: (rows: any[]) => void;
  onSortingChange?: (column: ColumnItemProps) => void;
  positionAction?: {
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    top?: number | string;
  };
  rows: Array<RowItemProps>;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface RowItemProps {
  [key: string]: any;
}

function FieldView({
  actionButton,
  columns,
  createItem = {},
  draggable = false,
  id,
  isAdd = false,
  isBorder = false,
  isDelete = false,
  isEdit = false,
  loading = false,
  onChange,
  onSortingChange = () => {},
  positionAction = { right: '0px', top: '-32px' },
  rows,
  sortColumn,
  sortDirection,
}: FieldViewProps) {
  const windowSize = useWindowSize();
  const [isShowAdd, setIsShowAdd] = useState<boolean>(false);
  const [itemAdded, setItemAdded] = useState<any>({});
  const wrapperRef = useRef<HTMLTableRowElement | null>(null);

  const onChangeItemAdded = useCallback(() => {
    const newData = rows.filter(item => item.id !== itemAdded?.id);
    onChange?.([...newData, { ...itemAdded, ...createItem }]);
    setItemAdded({});
    setIsShowAdd(false);
  }, [createItem, itemAdded, onChange, rows]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onChangeItemAdded();
      }
    };

    if (isShowAdd) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShowAdd, onChangeItemAdded]);

  if (!windowSize.width || !windowSize.height) {
    return <Spinner />;
  }

  const RESERVED_HEIGHT = 394;
  const LOADING_TABLE_HEIGHT = 300;

  const maxHeight = Math.max(
    windowSize.height - SIZES.HEADER_HEIGHT - SIZES.FOOTER_HEIGHT - RESERVED_HEIGHT,
    200,
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over?.id) {
      const activeIndex = rows.findIndex(({ id: itemId }) => itemId === active.id);
      const overIndex = rows.findIndex(({ id: itemId }) => itemId === over.id);
      onChange?.(arrayMove(rows, activeIndex, overIndex));
    }
  };

  const handleOnDeleteRow = (rowId: string) => {
    const newData = rows.filter((row: any) => row.id !== rowId);
    onChange?.(newData);
  };

  const handleOnEditCell = (rowId: string, columnId: string, newValue: string) => {
    const newData = rows.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          [columnId]: newValue,
        };
      }
      return item;
    });
    onChange?.(newData);
  };

  const handleOnChangeRow = (rowId: string, itemUpdated: any) => {
    const newData = [
      ...rows,
      {
        ...itemUpdated,
        ...createItem,
        id: rowId,
      },
    ];
    onChange?.(newData);
    setIsShowAdd(false);
  };

  const handleOnAddRow = () => {
    setIsShowAdd(true);
    if (itemAdded?.id) {
      onChangeItemAdded();
      setTimeout(() => {
        setIsShowAdd(true);
      }, 200);
    }
  };

  const renderDraggable = () => {
    return (
      <Box display="flex" justifyItems="center">
        <DragIndicatorIcon style={{ color: '#757575', cursor: 'grab' }} />
      </Box>
    );
  };

  const columnsCustom: ColumnItemProps[] = draggable
    ? [
        {
          align: 'left',
          cellSx: {
            width: '10px',
          },
          edit: false,
          id: 'drag',
          label: renderDraggable(),
          render: () => renderDraggable(),
        },
        ...columns,
      ]
    : columns;

  return (
    <DndContext onDragEnd={onDragEnd}>
      <TableContainer id={id} sx={{ maxHeight }}>
        {actionButton && isAdd && (
          <Button
            color="primary"
            onClick={handleOnAddRow}
            sx={{ borderRadius: '2px', position: 'absolute', ...positionAction }}
            variant="contained"
          >
            <span style={{ color: 'white', textTransform: 'capitalize' }}>
              {actionButton.text}
            </span>
          </Button>
        )}
        <MuiTable
          aria-label="sticky table"
          stickyHeader
          sx={{
            ...(isBorder
              ? { border: '1px solid rgba(224, 224, 224, 1)', borderBottom: 'none' }
              : {}),
          }}
        >
          <TableHead>
            <TableRow>
              {columnsCustom.map(column => (
                <TableCell
                  align={column.align}
                  key={column.id}
                  sx={{
                    bgcolor: '#EFFAFF',
                    color: '#0D8DC7',
                    fontSize: '15px',
                    fontWeight: 'medium',
                    height: '40px',
                    minWidth: column.minWidth,
                    padding: '0 16px',
                    ...column.headerCellSx,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortColumn === column.sortName}
                      direction={sortColumn === column.sortName ? sortDirection : 'asc'}
                      isDocumentType
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
              <SortableContext items={rows.map(row => row.id)}>
                {rows.map(row => {
                  return (
                    <FieldRow
                      columns={columnsCustom}
                      isDelete={isDelete}
                      isEdit={isEdit}
                      key={row.id}
                      onDeleteRow={handleOnDeleteRow}
                      onEditCell={handleOnEditCell}
                      row={row}
                    />
                  );
                })}
                {isShowAdd && (
                  <FieldRow
                    columns={columnsCustom}
                    isCreate
                    onEditRow={handleOnChangeRow}
                    opacityColumns={['id']}
                    ref={wrapperRef}
                    row={{
                      id: rows.length + 1,
                    }}
                    setItemAdded={setItemAdded}
                  />
                )}
              </SortableContext>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </DndContext>
  );
}

export default FieldView;
