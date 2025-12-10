'use client';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import type { TableCellProps } from '@mui/material/TableCell';
import TableCell from '@mui/material/TableCell';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import TextField from '@/components/TextField';

const Cell = styled(TableCell)(() => ({
  height: '40px',
  padding: '0 16px',
  position: 'relative',
}));

interface FieldCellProps extends TableCellProps {
  columnId: string;
  hover?: boolean;
  isCreate?: boolean;
  isEdit?: boolean;
  isEditColumn?: boolean;
  isFocus?: boolean;
  isLastItem?: boolean;
  onChangeRow?: (key: string, value: string) => void;
  onDeleteRow?: (id: string) => void;
  onEditCell?: (id: string, columnId: string, newValue: string) => void;
  opacityColumns?: string[];
  rowId: string;
  value?: string;
}

interface TextInputCellProps {
  children?: React.ReactNode;
  columnId?: string;
  handleClear?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleOnBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleOnChangeRow?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOnSaveCell?: () => void;
  input: string;
  isCreate?: boolean;
  isEdit?: boolean;
  isEditColumn?: boolean;
  isEditing?: boolean;
  isFocusing?: boolean;
  isLastItem?: boolean;
  opacityColumns?: string[];
}

function FieldCell({
  children,
  columnId,
  hover = false,
  isCreate = false,
  isEdit = false,
  isEditColumn = false,
  isFocus = false,
  isLastItem = false,
  onChangeRow,
  onDeleteRow,
  onDoubleClick,
  onEditCell,
  opacityColumns,
  rowId,
  value,
  ...props
}: FieldCellProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isFocusing, setIsFocusing] = useState<boolean>(isFocus);

  const [input, setInput] = useState<string>('');

  const handleOnSaveCell = () => {
    if (isCreate) {
      return;
    }
    onEditCell?.(rowId, columnId, input);
    setIsEditing(false);
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the blur event is caused by the clear button click
    if (e.relatedTarget?.getAttribute('data-clear-button') === 'true') {
      return; // Ignore blur caused by the clear button
    }
    handleOnSaveCell();
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInput('');
  };

  const handleOnChangeRow = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    onChangeRow?.(columnId, e.target.value);
  };

  useEffect(() => {
    setIsFocusing(isFocus);
  }, [isFocus]);

  return (
    <Cell
      {...props}
      onDoubleClick={e => {
        if (!isEditing) {
          onDoubleClick?.(e);
          setIsEditing(true);
          setIsFocusing(true);
          if (typeof children === 'string') {
            setInput(children === '--' ? '' : children);
          } else {
            setInput(value || '');
          }
        }
      }}
    >
      <TextInputCell
        columnId={columnId}
        handleClear={handleClear}
        handleOnBlur={handleOnBlur}
        handleOnChangeRow={handleOnChangeRow}
        handleOnSaveCell={handleOnSaveCell}
        input={input}
        isCreate={isCreate}
        isEdit={isEdit}
        isEditColumn={isEditColumn}
        isEditing={isEditing}
        isFocusing={isFocusing}
        isLastItem={isLastItem}
        opacityColumns={opacityColumns}
      >
        {children}
      </TextInputCell>
      {isLastItem && !isCreate && (
        <IconButton
          onClick={() => onDeleteRow?.(rowId)}
          sx={{
            opacity: hover ? 1 : 0,
            padding: '4px',
            position: 'absolute',
            right: 4,
            top: 3,
            transition: 'opacity 0.3s ease',
          }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      )}
    </Cell>
  );
}

function TextInputCell({
  children,
  columnId,
  handleClear,
  handleOnBlur,
  handleOnChangeRow,
  handleOnSaveCell,
  input,
  isCreate,
  isEdit,
  isEditColumn,
  isEditing,
  isFocusing,
  isLastItem,
  opacityColumns,
}: TextInputCellProps) {
  const inputComponent = (
    <TextField
      autoFocus={isFocusing}
      onBlur={handleOnBlur}
      onChange={handleOnChangeRow}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleOnSaveCell?.();
        }
      }}
      placeholder="Input text"
      slotProps={{
        input: {
          endAdornment: input && (
            <InputAdornment position="end" sx={{ zIndex: 1000 }}>
              <IconButton
                data-clear-button="true" // Unique attribute to identify the clear button
                edge="end"
                onClick={handleClear}
              >
                <Image
                  alt="Delete input icon"
                  height={20}
                  src="/icons/close.svg"
                  width={20}
                />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{
        ...(isLastItem && !isCreate ? { width: '93%' } : { width: '100%' }),
      }}
      value={input}
    />
  );
  if (isEdit && isEditing && isEditColumn) {
    return inputComponent;
  }
  if (isCreate && isEditColumn) {
    return inputComponent;
  }
  return (
    <span
      style={{
        opacity: columnId && opacityColumns?.includes(columnId) ? 0.4 : 1,
      }}
    >
      {children}
    </span>
  );
}

export default FieldCell;
