import { Box } from '@mui/material';
import type {
  GridCellModesModel,
  GridColDef,
  GridRowOrderChangeParams,
} from '@mui/x-data-grid-pro';
import { useTranslations } from 'next-intl';

import CustomDataGrid from '@/components/CustomDataGrid';

import type { CheckedIds, CorrectedItemWithId } from '../types';

interface FieldViewProps {
  cellModesModel: GridCellModesModel | undefined;
  currentGroupId: string;
  data: CorrectedItemWithId[];
  deleteIds: CheckedIds[];
  handleChangePosition: (newArr: CorrectedItemWithId[]) => void;
  handleSaveCellData: (id: string, isField: boolean, input: string) => void;
  removeCellModesModel: () => void;
  updateDeleteIds: (rowId: (number | string)[]) => void;
}

export function FieldView({
  cellModesModel,
  currentGroupId,
  data,
  deleteIds,
  handleChangePosition,
  handleSaveCellData,
  removeCellModesModel,
  updateDeleteIds,
}: FieldViewProps) {
  const tResultData = useTranslations('ResultData');

  const onDragEnd = (params: GridRowOrderChangeParams) => {
    const arr = [...data];
    const temp = arr[params.oldIndex];

    if (temp) {
      arr.splice(params.oldIndex, 1);
      arr.splice(params.targetIndex, 0, temp);
    }

    handleChangePosition(arr);
  };

  const columns: GridColDef<CorrectedItemWithId>[] = [
    {
      editable: true,
      field: 'item_name',
      headerName: tResultData('field'),
      sortable: false,
      width: 150,
    },
    {
      editable: true,
      field: 'extractions',
      flex: 1,
      headerName: tResultData('value'),
      sortable: false,
      valueGetter: params => {
        const { value } = params;

        if (value?.length > 0) {
          return value[0].text || '';
        }

        return '';
      },
      valueSetter: params => {
        const { row, value } = params;
        const extraction = row.extractions;

        if (extraction?.length > 0 && extraction[0]) {
          return {
            ...row,
            extractions: [
              {
                ...extraction[0],
                text: value,
              },
            ],
          };
        }

        return row;
      },
    },
  ];

  const handleEditCell = (rowId: string, field: string, newRow: CorrectedItemWithId) => {
    if (field === 'item_name') {
      handleSaveCellData(rowId, true, newRow?.item_name);
    } else {
      const { extractions } = newRow;

      if (extractions?.length > 0) {
        handleSaveCellData(rowId, false, extractions[0]?.text || '');
      } else {
        handleSaveCellData(rowId, false, '');
      }
    }
  };

  const getDeleteIds = () => {
    const ids = deleteIds?.find(
      (item: CheckedIds) => item.pageGroupId === currentGroupId,
    );

    if (ids) {
      return ids.rowIds;
    }

    return [];
  };

  const getCellModesModel = () => {
    if (cellModesModel) {
      const rowId = Object.keys(cellModesModel)[0];
      const row = data?.find(item => item.id === rowId);

      if (row) {
        return cellModesModel;
      }

      return undefined;
    }

    return undefined;
  };

  return (
    <Box>
      <CustomDataGrid
        cellModesModel={getCellModesModel()}
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
        rows={data || []}
        selectedRows={getDeleteIds()}
        showCellBorder
      />
    </Box>
  );
}
