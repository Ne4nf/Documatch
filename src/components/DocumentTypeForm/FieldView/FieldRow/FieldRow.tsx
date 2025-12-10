'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TableRow from '@mui/material/TableRow';
import React, { forwardRef, useState } from 'react';

import type { ColumnItemProps, RowItemProps } from '..';
import FieldCell from '../FieldCell';

interface FieldRowProps {
  columns: Array<ColumnItemProps>;
  isCreate?: boolean;
  isDelete?: boolean;
  isEdit?: boolean;
  onDeleteRow?: (id: string) => void;
  onEditCell?: (id: string, columnId: string, newValue: string) => void;
  onEditRow?: (id: string, itemUpdated?: any) => void;
  opacityColumns?: string[];
  row: any;
  rows?: Array<RowItemProps>;
  setItemAdded?: (value: any) => void;
}

const FieldRow = forwardRef<HTMLTableRowElement, FieldRowProps>(
  (
    {
      columns,
      isCreate,
      isDelete,
      isEdit,
      onDeleteRow,
      onEditCell,
      onEditRow,
      opacityColumns,
      row,
      setItemAdded,
    },
    ref,
  ) => {
    const [hover, setHover] = useState<boolean>(false);
    const [updateItem, setUpdateItem] = useState({});

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: row.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = () => setHover(false);

    const handleOnEnter = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (isCreate && e.key === 'Enter') {
        onEditRow?.(row.id, updateItem);
      }
    };

    const handleOnChangeRow = (key: string, value: string) => {
      setUpdateItem(prev => ({ ...prev, [key]: value }));
      setItemAdded?.((prev: any) => ({ ...prev, id: row.id, [key]: value }));
    };

    return (
      <TableRow
        onKeyDown={handleOnEnter}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={node => {
          setNodeRef(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            // eslint-disable-next-line no-param-reassign
            ref.current = node;
          }
        }}
        {...attributes}
        hover
        key={row?.id}
        role="checkbox"
        style={style}
        sx={{
          position: 'relative',
        }}
        tabIndex={-1}
      >
        {columns.map((column, index) => {
          const isLastItem = isDelete && columns.length - 1 === index;
          return (
            <FieldCell
              align={column.align}
              columnId={column.id}
              hover={hover}
              isCreate={isCreate}
              isEdit={isEdit}
              isEditColumn={column?.edit}
              isLastItem={isLastItem}
              key={column.id}
              onChangeRow={handleOnChangeRow}
              onDeleteRow={onDeleteRow}
              onEditCell={onEditCell}
              opacityColumns={opacityColumns}
              rowId={row.id}
              sx={{
                color: 'common.black',
                ...column.cellSx,
              }}
              value={row[column.id]}
              {...(column.id === 'drag' ? listeners : {})}
            >
              {(column.render ? column.render(row, index) : row[column.id]) || '--'}
            </FieldCell>
          );
        })}
      </TableRow>
    );
  },
);

FieldRow.displayName = 'FieldRow';

export default FieldRow;
