import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { GridCellModes, type GridCellModesModel } from '@mui/x-data-grid-pro';
import type {
  CorrectedTable,
  CorrectedTableColumn,
  CorrectedTableRow,
  Prompt,
} from '@nstypes/templateless';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import Link from '@/components/Link';
import { useGlobalDataStore } from '@/providers/global-data-store-provider';

import FieldView from './FieldView';
import RescanModal from './RescanModal';
import TableView from './TableView';
import type { CheckedIds, CorrectedItemWithId } from './types';

const ResultDataContainer = styled(Box)(() => ({
  backgroundColor: '#F4F4F4',
  width: '100%',
}));

const DocumentTypeLink = styled(Link)(() => ({
  color: '#242222',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '22px',
}));

const ButtonGroup = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 24px 13px 16px',
}));

const FilledButton = styled(Button)(() => ({
  backgroundColor: '#03A9F4',
  border: 'none',
  borderRadius: '2px',
  color: '#FFFFFF',
  padding: '9px 10px',
  textTransform: 'none',
  width: '90px',
}));

const OutlinedButton = styled(Button)(() => ({
  border: '1px solid #03A9F4',
  borderRadius: '2px',
  color: '#03A9F4',
  padding: '9px 10px',
  textTransform: 'none',
  width: '90px',
}));

const ActiveViewButton = styled(Button)(() => ({
  backgroundColor: '#03A9F4',
  border: 'none',
  borderRadius: '2px',
  color: '#FFFFFF',
  padding: '9px 10px',
  textTransform: 'none',
}));

const NonActiveViewButton = styled(Button)(() => ({
  backgroundColor: '#FFFFFF',
  border: 'none',
  borderRadius: '2px',
  color: '#797979',
  padding: '9px 10px',
  textTransform: 'none',
}));

const ChildButtonGroup1 = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
}));

const ChildButtonGroup2 = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '12px',
}));

const DataViewContainer = styled(Box)(() => ({
  borderTop: '1px solid #E8E8E8',
  padding: '16px 12px 0px 16px',
}));

const DataViewWrapper = styled(Box)(() => ({
  '&::-webkit-scrollbar': {
    height: '6px',
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    '&:hover': {
      backgroundColor: '#B3B3B3',
    },
    backgroundColor: '#D9D9D9',
    border: '3px solid transparent',
    borderRadius: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
  },
  height: 'calc(100vh - 180px)',
  overflow: 'auto',
  padding: '0px 6px 6px 0px',
  width: '100%',
}));

const DocumentTypeSettingButtonWrapper = styled(Box)(() => ({
  color: '#242222',
  fontSize: '14px',
  fontWeight: 500,
  marginBottom: '16px',
  marginRight: '24px',
  textAlign: 'right',
  textDecoration: 'underline',
  textUnderlineOffset: '5px',
}));

const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'new_';
  for (let i = 0; i < 8; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

type ResultDataProps = {
  currentGroupId: string;
  documentId: string;
  // TODO(chris) - ALO-210 - use 'any' type temporarily until pageGroups added to
  //  RawDocument. And when that is updated, the handler functions below should also
  //  be able to be cleaned up, removing isFieldView arguments in favor of using
  //  type guard functions.
  pageGroups: any;
  setIsReadyToSave: (isReadyToSave: boolean) => void;
  setPageGroups: (groups: any) => void;
};

export function ResultData({
  currentGroupId,
  documentId,
  pageGroups,
  setIsReadyToSave,
  setPageGroups,
}: ResultDataProps) {
  const tResultData = useTranslations('ResultData');

  // TODO change the data type in the API integration stage
  const [view, setView] = useState<string>('field');
  const [fieldViewData, setFieldViewData] = useState<CorrectedItemWithId[]>([]);
  const [tableViewData, setTableViewData] = useState<CorrectedTable | undefined>();
  const [fieldViewDeleteIds, setFieldViewDeleteIds] = useState<CheckedIds[]>([]);
  const [tableViewDeleteIds, setTableViewDeleteIds] = useState<CheckedIds[]>([]);
  const [promptId, setPromptId] = useState<string>('');
  const [isRescanModalOpen, setIsRescanModalOpen] = useState<boolean>(false);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>();
  const [newTableViewRowId, setNewTableViewRowId] = useState<string>('');

  const { prompts } = useGlobalDataStore(state => state);

  const updateFieldViewDeleteIds = (rowIds: (number | string)[]) => {
    const deleteIdsOfCurrentGroup = fieldViewDeleteIds?.find(
      (item: CheckedIds) => item.pageGroupId === currentGroupId,
    );

    if (deleteIdsOfCurrentGroup) {
      const newDeleteIds = fieldViewDeleteIds?.map((item: CheckedIds) => {
        if (item.pageGroupId !== currentGroupId) {
          return item;
        }
        return {
          ...item,
          rowIds,
        };
      });

      setFieldViewDeleteIds(newDeleteIds);
    } else {
      const newDeleteIds = [
        ...fieldViewDeleteIds,
        {
          pageGroupId: currentGroupId,
          rowIds,
        },
      ];

      setFieldViewDeleteIds(newDeleteIds);
    }
  };

  const updateTableViewDeleteIds = (rowIds: (number | string)[]) => {
    const deleteIdsOfCurrentGroup = tableViewDeleteIds?.find(
      (item: CheckedIds) => item.pageGroupId === currentGroupId,
    );

    if (deleteIdsOfCurrentGroup) {
      const newDeleteIds = tableViewDeleteIds?.map((item: CheckedIds) => {
        if (item.pageGroupId !== currentGroupId) {
          return item;
        }

        return {
          ...item,
          rowIds,
        };
      });

      setTableViewDeleteIds(newDeleteIds);
    } else {
      setTableViewDeleteIds([
        ...tableViewDeleteIds,
        {
          pageGroupId: currentGroupId,
          rowIds,
        },
      ]);
    }
  };

  const updateCorrectedItemsOfGroup = (newData: CorrectedItemWithId[]) => {
    setPageGroups(
      pageGroups?.map((item: any) => {
        if (item.id === currentGroupId) {
          return {
            ...item,
            correctedItems: newData,
          };
        }
        return item;
      }),
    );
    setIsReadyToSave(true);
  };

  const updateCorrectedTablesOfGroup = (newData: CorrectedTable | undefined) => {
    setPageGroups(
      pageGroups?.map((item: any) => {
        if (item.id === currentGroupId) {
          return {
            ...item,
            correctedTables: [newData],
          };
        }
        return item;
      }),
    );
    setIsReadyToSave(true);
  };

  const getNewTableRowId = (ids: string[] | undefined) => {
    if (!ids || ids?.length === 0) {
      return 'row_0';
    }

    const nums = ids?.map((item: string) => Number(item?.substring(4)));
    const max = Math.max(...nums);
    return `row_${max + 1}`;
  };

  const handleAddFieldViewRow = () => {
    const newRow = {
      extractions: [
        {
          bounding_boxes: [
            {
              xmax: 0.01,
              xmin: 0,
              ymax: 0.01,
              ymin: 0,
            },
          ],
          originalIndex: 0,
          originalItemName: '',
          text: '',
        },
      ],
      id: generateRandomString(),
      item_name: '',
    };
    const newFieldViewData = [...fieldViewData, newRow];

    updateCorrectedItemsOfGroup(newFieldViewData);

    setCellModesModel({
      [newRow.id]: {
        item_name: { mode: GridCellModes.Edit },
      },
    });
  };

  const handleAddTableViewRow = () => {
    const rows = tableViewData?.rows;

    if (rows && rows.length > 0 && rows[0]) {
      const newRow = { ...rows[0] };
      newRow.row_id = getNewTableRowId(tableViewData?.rows?.map(row => row.row_id));

      const newColumns = newRow?.columns?.map(column => ({
        ...column,
        extractions: [
          {
            bounding_boxes: column?.extractions[0]?.bounding_boxes || [],
            text: '',
          },
        ],
      }));

      newRow.columns = newColumns;
      const newRows = [...rows, newRow];
      const newTableViewData = { ...tableViewData, rows: newRows };

      updateCorrectedTablesOfGroup(newTableViewData);
      setNewTableViewRowId(newRow.row_id);
    }
  };

  const handleAddRow = () => {
    if (view === 'field') {
      handleAddFieldViewRow();
    } else {
      handleAddTableViewRow();
    }
  };

  const removeCellModesModel = () => {
    setCellModesModel(undefined);
  };

  const handleChangePositionFieldView = (newArr: CorrectedItemWithId[]) => {
    updateCorrectedItemsOfGroup(newArr);
  };
  const handleChangePositionTableView = (newArr: CorrectedTableRow[]) => {
    if (tableViewData) {
      const newTableViewData = {
        ...tableViewData,
        rows: newArr,
      };

      updateCorrectedTablesOfGroup(newTableViewData);
    }
  };

  const handleEditFieldViewData = (id: string, isField: boolean, newValue: string) => {
    const newData = fieldViewData?.map(item => {
      if (item.id === id) {
        if (isField) {
          return {
            ...item,
            item_name: newValue,
          };
        }

        const { extractions } = item;

        if (extractions && extractions[0]) {
          const temp = {
            ...item,
            extractions: [
              {
                ...extractions[0],
                text: newValue,
              },
            ],
          };

          return temp;
        }
      }
      return item;
    });

    updateCorrectedItemsOfGroup(newData);
  };

  const handleEditTableViewData = (rowId: string, columns: CorrectedTableColumn[]) => {
    if (tableViewData) {
      const tableRows = tableViewData.rows;

      const newRows = tableRows?.map(row => {
        if (row?.row_id === rowId) {
          return {
            ...row,
            columns,
          };
        }

        return row;
      });

      const newTableViewData = {
        ...tableViewData,
        rows: newRows,
      };

      updateCorrectedTablesOfGroup(newTableViewData);
    }
  };

  const handleDelete = () => {
    if (view === 'field') {
      const deleteIds = fieldViewDeleteIds?.find(
        (checkedIds: CheckedIds) => checkedIds.pageGroupId === currentGroupId,
      );

      if (deleteIds) {
        const newFieldViewData = fieldViewData?.filter(
          item => !deleteIds?.rowIds?.includes(item.id),
        );

        const newDeleteIds = fieldViewDeleteIds?.filter(
          item => item.pageGroupId !== currentGroupId,
        );

        setFieldViewDeleteIds(newDeleteIds);
        updateCorrectedItemsOfGroup(newFieldViewData);
      }
    } else if (tableViewData) {
      const { rows } = tableViewData;
      const deleteIds = tableViewDeleteIds.find(
        checkedIds => checkedIds.pageGroupId === currentGroupId,
      );

      if (deleteIds) {
        const newRows = rows?.filter(item => !deleteIds?.rowIds?.includes(item.row_id));

        const newTableViewData = {
          ...tableViewData,
          rows: newRows,
        };

        const newDeleteIds = tableViewDeleteIds.filter(
          item => item.pageGroupId !== currentGroupId,
        );

        setTableViewDeleteIds(newDeleteIds);
        updateCorrectedTablesOfGroup(newTableViewData);
      }
    }
  };

  const addIdIntoArrayElements = (group: any) => {
    return group?.correctedItems?.map((item: any) => {
      if (item?.id) {
        return {
          ...item,
        };
      }
      return {
        ...item,
        id: generateRandomString(),
      };
    });
  };

  const getDocumentTypeName = () => {
    if (!prompts || prompts?.length === 0 || !promptId) {
      return '';
    }

    const documentType = prompts?.find(
      (item: Prompt) => item.id?.toString() === promptId,
    );
    return documentType?.name;
  };

  useEffect(() => {
    if (currentGroupId && pageGroups) {
      const group = pageGroups?.find((item: any) => item.id === currentGroupId);

      if (group) {
        setPromptId(group?.promptId);
        setFieldViewData(addIdIntoArrayElements(group));
        setTableViewData(group?.correctedTables ? group?.correctedTables[0] : undefined);
      }
    }
  }, [currentGroupId, pageGroups]);

  return (
    <ResultDataContainer>
      <ButtonGroup>
        <ChildButtonGroup1>
          {view === 'field' ? (
            <ActiveViewButton onClick={() => setView('field')} variant="contained">
              {tResultData('fieldView')}
            </ActiveViewButton>
          ) : (
            <NonActiveViewButton onClick={() => setView('field')} variant="outlined">
              {tResultData('fieldView')}
            </NonActiveViewButton>
          )}

          {view === 'table' ? (
            <ActiveViewButton onClick={() => setView('table')} variant="contained">
              {tResultData('tableView')}
            </ActiveViewButton>
          ) : (
            <NonActiveViewButton onClick={() => setView('table')} variant="outlined">
              {tResultData('tableView')}
            </NonActiveViewButton>
          )}
        </ChildButtonGroup1>

        <ChildButtonGroup2>
          <FilledButton onClick={() => setIsRescanModalOpen(true)} variant="contained">
            {tResultData('reScan')}
          </FilledButton>

          <RescanModal
            currentGroupId={currentGroupId}
            documentId={documentId}
            documentTypes={prompts}
            handleCloseModal={() => setIsRescanModalOpen(false)}
            isModalOpen={isRescanModalOpen}
          />

          <FilledButton onClick={handleAddRow} variant="contained">
            {tResultData('addRow')}
          </FilledButton>

          <OutlinedButton
            onClick={handleDelete}
            startIcon={<DeleteOutlineIcon />}
            variant="outlined"
          >
            {tResultData('delete')}
          </OutlinedButton>
        </ChildButtonGroup2>
      </ButtonGroup>

      {getDocumentTypeName() && (
        <DocumentTypeSettingButtonWrapper>
          <DocumentTypeLink href={`/document-type/${promptId}`}>
            {getDocumentTypeName()}
          </DocumentTypeLink>
        </DocumentTypeSettingButtonWrapper>
      )}

      {view === 'field' && (
        <DataViewContainer>
          <DataViewWrapper>
            <FieldView
              cellModesModel={cellModesModel}
              currentGroupId={currentGroupId}
              data={fieldViewData}
              deleteIds={fieldViewDeleteIds}
              handleChangePosition={handleChangePositionFieldView}
              handleSaveCellData={handleEditFieldViewData}
              removeCellModesModel={removeCellModesModel}
              updateDeleteIds={updateFieldViewDeleteIds}
            />
          </DataViewWrapper>
        </DataViewContainer>
      )}

      {view === 'table' && (
        <DataViewContainer>
          <DataViewWrapper>
            <TableView
              cellModesModel={cellModesModel}
              currentGroupId={currentGroupId}
              data={tableViewData}
              deleteIds={tableViewDeleteIds}
              handleChangePosition={handleChangePositionTableView}
              handleEditTableViewData={handleEditTableViewData}
              newTableViewRowId={newTableViewRowId}
              removeCellModesModel={removeCellModesModel}
              setCellModesModel={setCellModesModel}
              updateDeleteIds={updateTableViewDeleteIds}
            />
          </DataViewWrapper>
        </DataViewContainer>
      )}
    </ResultDataContainer>
  );
}
