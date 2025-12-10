import type { SxProps } from '@mui/material';
import type {
  GridCellModesModel,
  GridColDef,
  GridRowOrderChangeParams,
} from '@mui/x-data-grid-pro';
import { DataGridPro } from '@mui/x-data-grid-pro';
import type { CorrectedTableRow } from '@nstypes/templateless';
import { useEffect, useRef } from 'react';

import type { CorrectedItemWithId } from '@/components/ResultData/types';
import { isFieldRow, isTableRow } from '@/utils';

type CustomDataGridProps<T extends CorrectedItemWithId | CorrectedTableRow> = {
  cellModesModel: GridCellModesModel | undefined;
  checkboxSelection?: boolean;
  columnHeaderHeight?: number;
  columns: GridColDef<T>[];
  handleEditCell: (rowId: string, field: string, newRow: T) => void;
  hideFooter?: boolean;
  noRowsLabel?: string;
  onRowOrderChange?: (param: GridRowOrderChangeParams) => void;
  onSelectRow?: (param: (number | string)[]) => void;
  removeCellModesModel: () => void;
  rowHeight?: number;
  rowReordering?: boolean;
  rows: T[];
  selectedRows?: (number | string)[];
  showCellBorder?: boolean;
};

const dataGridStyle: SxProps = {
  '& .MuiDataGrid-cell': {
    '& .MuiDataGrid-editInputCell': {
      '& .MuiInputBase-input': {
        paddingLeft: '10px',
        paddingRight: '10px',
      },
      height: '100%',
    },
  },
  '& .MuiDataGrid-columnHeaderReorder': {
    borderRight: 'none !important',
  },
  '& .MuiDataGrid-columnHeaders': {
    '& .MuiDataGrid-columnHeader': {
      '&:focus': {
        outline: 'none',
      },
      borderRight: '1px solid rgba(224, 224, 224, 1)',
    },

    backgroundColor: '#EFFAFF !important',
    color: '#0D8DC7',
    fontSize: '14px',
    fontWeight: 500,
  },
  '& .MuiDataGrid-row': {
    '&:hover': {
      backgroundColor: '#F4F4F4',
    },
    backgroundColor: '#FFFFFF',
    color: '#242222',
    fontSize: '14px',
  },
  '& .MuiDataGrid-rowReorderCellContainer': {
    '& .MuiSvgIcon-root': {
      color: '#757575',
    },
    borderRight: 'none !important',
  },
  minWidth: 300,
  width: '100%',
};

export function CustomDataGrid<T extends CorrectedItemWithId | CorrectedTableRow>({
  cellModesModel,
  checkboxSelection,
  columnHeaderHeight,
  columns,
  handleEditCell,
  hideFooter,
  noRowsLabel,
  onRowOrderChange,
  onSelectRow,
  removeCellModesModel,
  rowHeight,
  rowReordering,
  rows,
  selectedRows,
  showCellBorder,
}: CustomDataGridProps<T>) {
  const ref = useRef<null | string>(null);

  useEffect(() => {
    if (cellModesModel) {
      removeCellModesModel();
      ref.current = columns[0]?.field || '';
    }
  }, [cellModesModel]);

  return (
    <DataGridPro
      autoHeight
      cellModesModel={cellModesModel}
      checkboxSelection={checkboxSelection}
      columnHeaderHeight={columnHeaderHeight}
      columns={columns}
      disableColumnMenu
      disableColumnReorder
      disableMultipleColumnsSorting
      disableRowSelectionOnClick={checkboxSelection}
      getRowId={row => ('id' in row ? row.id : row.row_id)}
      hideFooter={hideFooter}
      localeText={{
        noRowsLabel,
      }}
      onCellEditStart={(param: { field: string }) => {
        ref.current = param.field;
      }}
      onRowOrderChange={onRowOrderChange}
      onRowSelectionModelChange={newRowSelectionModel => {
        onSelectRow?.(newRowSelectionModel);
      }}
      processRowUpdate={(newRow, oldRow) => {
        if (ref.current) {
          if (isFieldRow(oldRow) && isFieldRow(newRow)) {
            handleEditCell(oldRow?.id, ref.current, newRow);
          }
          if (isTableRow(oldRow) && isTableRow(newRow)) {
            handleEditCell(oldRow?.row_id, ref.current, newRow);
          }
        }

        return newRow;
      }}
      rowHeight={rowHeight}
      rowReordering={rowReordering}
      rows={rows}
      rowSelectionModel={selectedRows}
      showCellVerticalBorder={showCellBorder}
      sx={dataGridStyle}
    />
  );
}
