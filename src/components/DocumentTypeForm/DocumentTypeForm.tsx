'use client';

import { TableChartOutlined, TableRowsOutlined } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useGlobalDataStore } from '@/providers/global-data-store-provider';

import type { DocumentTableSortColumns } from '../DocumentList/types';
import Tabs from '../Tabs';
import ValidateField from '../ValidateField';
import type { ColumnItemProps } from './FieldView/FieldView';
import FieldView from './FieldView/FieldView';
import FormItem from './FormItem';
import TableView from './TableView';

const WrapperContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginBottom: '48px',
  maxWidth: '100%',
  paddingTop: '16px',
}));

export interface FormError {
  [key: string]: {
    error: boolean;
    helperText: string;
  };
}

export interface PayloadDocumentTypeForm {
  documentType?: string;
  extractTable?: boolean;
  fieldsPrompt?: PromptItem[];
  name?: string;
  tablePrompt?: PromptItem[];
  textualTablePrompt?: string;
  userCustomInstructions?: string;
}

interface DocumentTypeFormProps {
  formError?: FormError;
  formValue?: PayloadDocumentTypeForm;
  isCopyPreset?: boolean;
  isLoading?: boolean;
  onChange?: (newValue: PayloadDocumentTypeForm) => void;
}

interface PromptItem {
  id?: string;
  instruction?: string;
  isPreset?: boolean;
  item: string;
}

function DocumentTypeForm({
  formError,
  formValue,
  isCopyPreset,
  isLoading = false,
  onChange,
}: DocumentTypeFormProps) {
  const t = useTranslations('DocumentTypeForm');

  const { setSortColumn, setSortDirection, sortColumn, sortDirection } =
    useGlobalDataStore(state => state);

  const [fieldsPromptItems, setFieldsPromptItems] = useState<PromptItem[]>(
    formValue?.fieldsPrompt || [],
  );
  const [tablePromptItems, setTablePromptItems] = useState<PromptItem[]>(
    formValue?.tablePrompt || [],
  );

  const [activeTab, setActiveTab] = useState<number | string>('field');

  const getActiveGroup = () => {
    if (!formValue?.extractTable) {
      return 'doNotExtractTable';
    }
    if (formValue?.textualTablePrompt) {
      return 'freeInstruction';
    }
    return 'custom';
  };
  const [activeGroup, setActiveGroup] = useState<string>(getActiveGroup());

  const isFieldTab = activeTab === 'field';

  const removeUnusedPrompts = (
    tab: number | string = activeTab,
    group: string = activeGroup,
  ): PayloadDocumentTypeForm => {
    const cloneValue: PayloadDocumentTypeForm = structuredClone(formValue || {});
    if (tab === 'table') {
      const isFreeInstruction = group === 'freeInstruction';
      const isDoNotExtractTable = group === 'doNotExtractTable';
      cloneValue.extractTable = isFreeInstruction
        ? !!cloneValue.textualTablePrompt
        : !!cloneValue?.tablePrompt?.length;
      if (isFreeInstruction) {
        if (cloneValue.textualTablePrompt) {
          delete cloneValue.tablePrompt;
        }
      } else if (isDoNotExtractTable) {
        cloneValue.extractTable = false;
      } else if (cloneValue.tablePrompt?.length) {
        delete cloneValue.textualTablePrompt;
      }
    } else if (!cloneValue.tablePrompt?.length) {
      delete cloneValue.tablePrompt;
    }

    return cloneValue;
  };

  const addMissingPromptItemIds = (data: PromptItem[]) => {
    return data.map((item, index) => ({
      ...item,
      id: item.id || String(index + 1),
    }));
  };

  const handleSortingChange = (column: ColumnItemProps) => {
    const newSortColumn = column.sortName || 'id';
    const didSortColumnChange = sortColumn !== column.sortName;
    const newSortDirection =
      didSortColumnChange || sortDirection === 'desc' ? 'asc' : 'desc';

    setSortColumn(newSortColumn as DocumentTableSortColumns);
    setSortDirection(newSortDirection);

    const cloneValue = removeUnusedPrompts();

    const sortData = (data: PromptItem[]) => {
      return data.sort((a, b) => {
        const aValue = a[newSortColumn as keyof PromptItem] ?? '';
        const bValue = b[newSortColumn as keyof PromptItem] ?? '';
        if (newSortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    };

    const sortedItems = addMissingPromptItemIds(
      isFieldTab ? sortData(fieldsPromptItems) : sortData(tablePromptItems),
    );
    if (isFieldTab) {
      setFieldsPromptItems(sortedItems);
      cloneValue.fieldsPrompt = sortedItems;
    } else {
      setTablePromptItems(sortedItems);
      cloneValue.tablePrompt = sortedItems;
    }
    onChange?.(cloneValue);
  };

  const handleOnChangeRow = (newData: PromptItem[]) => {
    const cloneValue = removeUnusedPrompts(activeTab, activeGroup);

    if (isFieldTab) {
      cloneValue.fieldsPrompt = newData;
      setFieldsPromptItems(newData);
    } else {
      cloneValue.tablePrompt = newData;
      setTablePromptItems(newData);
      if (newData.length > 0) {
        cloneValue.textualTablePrompt = '';
      }
    }

    cloneValue.extractTable = newData.length > 0;
    onChange?.(cloneValue);
  };

  const handleOnChangeTab = (tab: number | string) => {
    const cloneValue = removeUnusedPrompts(tab, activeGroup);
    setActiveTab(tab);
    onChange?.(cloneValue);
  };

  const handleOnChangeGroup = (group: string) => {
    const cloneValue = removeUnusedPrompts(activeTab, group);
    setActiveGroup(group);
    onChange?.(cloneValue);
  };

  const handleOnChangeDocumentName = (value: string) => {
    const cloneValue = removeUnusedPrompts();
    cloneValue.name = value;
    onChange?.(cloneValue);
  };

  const handleOnChangeDocumentType = (value: string) => {
    const cloneValue = removeUnusedPrompts();
    cloneValue.documentType = value;
    onChange?.(cloneValue);
  };

  const handleOnChangeOverview = (value: string) => {
    const cloneValue = removeUnusedPrompts();
    cloneValue.userCustomInstructions = value;
    onChange?.(cloneValue);
  };

  const handleOnChangeFreeInstruction = (value: string) => {
    const cloneValue = removeUnusedPrompts();
    cloneValue.textualTablePrompt = value;
    onChange?.(cloneValue);
  };

  const columns: ColumnItemProps[] = [
    {
      align: 'center',
      edit: false,
      id: 'id',
      label: t('no'),
    },
    {
      align: 'left',
      edit: true,
      id: 'item',
      label: t('fieldName'),
      render: row => (
        <Box alignItems="center" display="flex" gap="8px">
          {row?.item && row?.isPreset ? (
            <>
              {row.item}{' '}
              {row.isPreset && (
                <Chip
                  color="primary"
                  label="Pre-set"
                  sx={{ bgcolor: '#EFFAFF', borderColor: '#7DC2E2' }}
                  variant="outlined"
                />
              )}
            </>
          ) : (
            row?.item || '--'
          )}
        </Box>
      ),
      sortable: true,
      sortName: 'item',
    },
    {
      align: 'left',
      edit: true,
      id: 'instruction',
      label: t('specialInstructions'),
      sortable: true,
      sortName: 'instruction',
    },
  ];

  const createItem = isCopyPreset
    ? {
        isPreset: true,
      }
    : {};

  useEffect(() => {
    setFieldsPromptItems(formValue?.fieldsPrompt || []);
  }, [formValue?.fieldsPrompt]);

  useEffect(() => {
    setTablePromptItems(formValue?.tablePrompt || []);
  }, [formValue?.tablePrompt]);

  return (
    <WrapperContainer>
      <FormItem
        defaultValue={formValue?.name}
        error={formError?.name?.error || false}
        helperText={formError?.name?.helperText || ''}
        label={t('name')}
        onChange={e => handleOnChangeDocumentName(e.target.value)}
        placeholder={t('inputFieldName')}
        required
      />
      <FormItem
        defaultValue={formValue?.documentType}
        error={formError?.documentType?.error || false}
        helperText={formError?.documentType?.helperText || ''}
        label={t('documentTypeName')}
        onChange={e => handleOnChangeDocumentType(e.target.value)}
        placeholder={t('inputFieldTypeName')}
        required
      />
      <FormItem
        defaultValue={formValue?.userCustomInstructions}
        label={t('generalInstructions')}
        onChange={e => handleOnChangeOverview(e.target.value)}
        placeholder={t('inputFieldOver')}
        type="textarea"
      />
      <Tabs
        onChange={value => handleOnChangeTab(value)}
        tabData={[
          {
            content: (
              <ValidateField
                {...(formError?.fieldsPrompt
                  ? {
                      ...formError?.fieldsPrompt,
                    }
                  : {})}
              >
                <FieldView
                  actionButton={{
                    text: t('addRow'),
                  }}
                  columns={columns}
                  createItem={createItem}
                  draggable
                  id="DocumentTypeFieldView"
                  isAdd
                  isBorder
                  isDelete
                  isEdit
                  loading={isLoading}
                  onChange={handleOnChangeRow}
                  onSortingChange={handleSortingChange}
                  positionAction={{ bottom: '-58px', left: '0px' }}
                  rows={addMissingPromptItemIds(fieldsPromptItems)}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </ValidateField>
            ),
            icon: <TableRowsOutlined height="24px" width="24px" />,
            label: t('field'),
            value: 'field',
          },
          {
            content: (
              <TableView
                defaultValueGroup={activeGroup}
                error={formError?.tablePrompt}
                fieldView={{
                  actionButton: {
                    text: t('addRow'),
                  },
                  columns,
                  createItem,
                  draggable: true,
                  id: 'DocumentTypeFieldView',
                  isAdd: true,
                  isBorder: true,
                  isDelete: true,
                  isEdit: true,
                  loading: isLoading,
                  onChange: handleOnChangeRow,
                  onSortingChange: handleSortingChange,
                  positionAction: { bottom: '-58px', left: '0px' },
                  rows: addMissingPromptItemIds(tablePromptItems),
                  sortColumn,
                  sortDirection,
                }}
                freeInstruction={formValue?.textualTablePrompt}
                onChangeFreeInstruction={handleOnChangeFreeInstruction}
                onChangeGroup={handleOnChangeGroup}
              />
            ),
            icon: <TableChartOutlined height="24px" width="24px" />,
            label: t('table'),
            value: 'table',
          },
        ]}
      />
    </WrapperContainer>
  );
}

export default DocumentTypeForm;
