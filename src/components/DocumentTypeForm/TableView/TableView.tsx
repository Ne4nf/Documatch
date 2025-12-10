'use client';

import { Box } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import ValidateField from '@/components/ValidateField';

import type { FieldViewProps } from '../FieldView';
import FieldView from '../FieldView';
import FormItem from '../FormItem';

export interface RowItemProps {
  [key: string]: any;
}

interface TableViewProps {
  defaultValueGroup?: string;
  error?: any;
  fieldView?: FieldViewProps;
  freeInstruction?: string;
  onChangeFreeInstruction?: (value: string) => void;
  onChangeGroup?: (value: string) => void;
}

function TableView({
  defaultValueGroup = 'freeInstruction',
  error = {},
  fieldView,
  freeInstruction = '',
  onChangeFreeInstruction,
  onChangeGroup,
}: TableViewProps) {
  const t = useTranslations('DocumentTypeForm');

  const [group, setGroup] = useState<string>(defaultValueGroup);

  const handleChangeGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGroup((event.target as HTMLInputElement).value);
    onChangeGroup?.((event.target as HTMLInputElement).value);
  };

  const handleOnChangeFreeInstruction = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    onChangeFreeInstruction?.(e.target.value);
  };

  useEffect(() => {
    setGroup(defaultValueGroup);
  }, [defaultValueGroup]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="12px"
      marginBottom="48px"
      position="relative"
    >
      <FormControl>
        <RadioGroup
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          onChange={handleChangeGroup}
          row
          value={group}
        >
          <FormControlLabel control={<Radio />} label={t('custom')} value="custom" />
          <FormControlLabel
            control={<Radio />}
            label={t('freeInstruction')}
            value="freeInstruction"
          />
          <FormControlLabel
            control={<Radio />}
            label={t('doNotExtractTable')}
            value="doNotExtractTable"
          />
        </RadioGroup>
      </FormControl>
      {group === 'freeInstruction' && (
        <FormItem
          defaultValue={freeInstruction}
          height="281px"
          onChange={handleOnChangeFreeInstruction}
          placeholder={t('inputFieldFree')}
          rows={11}
          type="textarea"
        />
      )}
      {group === 'custom' && fieldView && (
        <Box position="relative">
          <ValidateField {...error}>
            <FieldView
              positionAction={{
                bottom: '-54px',
                left: '0px',
              }}
              {...fieldView}
            />
          </ValidateField>
        </Box>
      )}
    </Box>
  );
}

export default TableView;
