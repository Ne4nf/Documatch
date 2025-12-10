'use client';

import { Box } from '@mui/material';
import {
  GridCellModes,
  type GridCellModesModel,
  type GridColDef,
  type GridRowOrderChangeParams,
} from '@mui/x-data-grid-pro';
import type {
  CorrectedTable,
  CorrectedTableColumn,
  CorrectedTableRow,
} from '@nstypes/templateless';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import CustomDataGrid from '@/components/CustomDataGrid';
import type { CheckedIds } from '@/components/ResultData/types';

interface TableViewProps {
  cellModesModel: GridCellModesModel | undefined;
  currentGroupId: string;
  data: CorrectedTable | undefined;
  deleteIds: CheckedIds[];
  handleChangePosition: (newArr: CorrectedTableRow[]) => void;
  handleEditTableViewData: (rowId: string, columns: CorrectedTableColumn[]) => void;
  newTableViewRowId: string;
  removeCellModesModel: () => void;
  setCellModesModel: (model: GridCellModesModel | undefined) => void;
  updateDeleteIds: (rowId: (number | string)[]) => void;
}

export function TableView({
  cellModesModel,
  currentGroupId,
  data,
  deleteIds,
  handleChangePosition,
  handleEditTableViewData,
  newTableViewRowId,
  removeCellModesModel,
  setCellModesModel,
  updateDeleteIds,
}: TableViewProps) {
  const tResultData = useTranslations('ResultData');

  const onDragEnd = (params: GridRowOrderChangeParams) => {
    const arr = [...(data?.rows || [])];
    const temp = arr[params.oldIndex];

    if (temp) {
      arr.splice(params.oldIndex, 1);
      arr.splice(params.targetIndex, 0, temp);
    }

    handleChangePosition(arr);
  };

  const getColumnNames = () => {
    const rows = data?.rows;

    if (rows?.length && rows?.length > 0) {
      const firstRow = data?.rows[0];
      const headers = firstRow?.columns?.map(item => item.id_);

      return headers || [];
    }

    return [];
  };

  const columns: GridColDef<CorrectedTableRow>[] = getColumnNames()?.map(
    (column: string, index: number) => {
      const gridCol: GridColDef<CorrectedTableRow> = {
        editable: true,
        field: column,
        flex: 1,
        headerName: column,
        minWidth: 100,
        sortable: false,
        valueGetter: params => {
          const { row } = params;

          const col = row.columns?.find(
            (item: CorrectedTableColumn) => item.id_ === column,
          );

          if (col) {
            return col.extractions[0]?.text || '';
          }
          return '';
        },
        valueSetter: params => {
          const { row, value } = params;

          const cols = row.columns;

          if (cols?.length > 0) {
            const newCols = cols.map((col: CorrectedTableColumn) => {
              if (col.id_ === column) {
                const extraction = col.extractions;

                if (extraction?.length > 0 && extraction[0]) {
                  return {
                    ...col,
                    extractions: [
                      {
                        ...extraction[0],
                        text: value,
                      },
                    ],
                  };
                }
              }
              return col;
            });

            return {
              ...row,
              columns: newCols,
            };
          }

          return row;
        },
      };

      if (index === getColumnNames().length - 1) {
        gridCol.flex = 1;
        gridCol.minWidth = 100;
      } else {
        gridCol.width = 100;
      }

      return gridCol;
    },
  );

  const getDeleteIds = () => {
    const ids = deleteIds?.find(
      (item: CheckedIds) => item.pageGroupId === currentGroupId,
    );

    if (ids) {
      return ids.rowIds;
    }

    return [];
  };

  const handleEditCell = (rowId: string, field: string, newRow: CorrectedTableRow) => {
    const cols = newRow.columns;

    if (cols?.length > 0) {
      handleEditTableViewData(rowId, cols);
    }
  };

  useEffect(() => {
    if (
      newTableViewRowId &&
      columns &&
      columns.length > 0 &&
      data?.rows &&
      data?.rows?.length > 0
    ) {
      if (data?.rows?.find(row => row.row_id === newTableViewRowId)) {
        const firstCellField = columns[0]?.field ? columns[0].field : '';

        if (firstCellField) {
          setCellModesModel({
            [newTableViewRowId]: {
              [firstCellField]: { mode: GridCellModes.Edit },
            },
          });
        }
      }
    }
  }, [newTableViewRowId, data?.rows?.length]);

  return (
    <Box>
      <CustomDataGrid
        cellModesModel={cellModesModel}
        checkboxSelection
        columnHeaderHeight={40}
        columns={columns}
        handleEditCell={handleEditCell}
        hideFooter
        noRowsLabel={tResultData('noData')}
        onRowOrderChange={onDragEnd}
        onSelectRow={(ids: (number | string)[]) => updateDeleteIds(ids)}
        removeCellModesModel={removeCellModesModel}
        rowHeight={40}
        rowReordering
        rows={data?.rows || []}
        selectedRows={getDeleteIds()}
        showCellBorder
      />
    </Box>
  );
}
