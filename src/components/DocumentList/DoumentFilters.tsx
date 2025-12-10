import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import type { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import Checkbox from '@/components/Checkbox';
import DateRangePicker from '@/components/DateRangePicker';
import TextField from '@/components/TextField';
import TextInputClearButtonAdornment from '@/components/TextInputClearButtonAdornment';
import TextLabel from '@/components/TextLabel';
import type { SearchFilters } from '@/types';

import { filterableDocumentStatuses } from './DocumentList';

interface SearchBoxProps {
  onFiltersChanged: (newFilters: SearchFilters) => Promise<void>;
  searchFilters: SearchFilters;
}

const Row = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
}));

const Item = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
  marginRight: '20px',
  width: '240px',
}));

const Label = styled(TextLabel)(() => ({
  marginRight: '10px',
  textWrap: 'nowrap',
}));

const Input = styled(TextField)(() => ({
  flex: 1,
  width: '200px',
}));

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  backgroundColor: theme.palette.primary.main,
  bottom: '12px',
  height: '35px',
  mr: '13px',
  position: 'absolute',
  right: '15px',
  width: '35px',
}));

type Action =
  | {
      payload: [DateTime | null, DateTime | null];
      type: 'setCreatedAtDateRange';
    }
  | {
      payload: [DateTime | null, DateTime | null];
      type: 'setUpdatedAtDateRange';
    }
  | { payload: string; type: 'checkStatus' }
  | { payload: string; type: 'setDocumentName' }
  | { payload: string; type: 'toggleStatusCheck' }
  | { payload: string; type: 'uncheckStatus' };

function DocumentFilters({ onFiltersChanged, searchFilters }: SearchBoxProps) {
  const t = useTranslations('DocumentList');
  const [state, dispatch] = React.useReducer(reducer, searchFilters);

  const handleSubmit = async () => {
    const newState = { ...state };

    if (state.documentName) {
      if (state.documentName.trim().length === 0) {
        newState.documentName = null;
      } else {
        newState.documentName = state?.documentName.trim();
      }
    }

    await onFiltersChanged(newState);
  };

  const handleClearDocumentNameClick = () => {
    dispatch({ payload: '', type: 'setDocumentName' });
  };

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        border: '0.6px solid #9a9a9a',
        filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.25))',
        marginBottom: '10px',
        padding: '24px 15px 0 24px',
        position: 'relative',
        width: '100%',
      }}
    >
      <Row>
        <Item>
          <Label>{t('documentName')}</Label>
          <Input
            onChange={e => dispatch({ payload: e.target.value, type: 'setDocumentName' })}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                handleSubmit();
              }
            }}
            slotProps={{
              htmlInput: {
                'aria-label': 'documentName',
              },
              input: {
                endAdornment: state.documentName && state.documentName.length > 0 && (
                  <TextInputClearButtonAdornment onClick={handleClearDocumentNameClick} />
                ),
              },
            }}
            value={state.documentName || ''}
          />
        </Item>
      </Row>

      <Row>
        <Item
          sx={{
            width: 'unset',
          }}
        >
          <Label>{t('status')}</Label>
          <Box>
            {filterableDocumentStatuses.map(documentStatus => {
              return (
                <Checkbox
                  checked={state.statuses[documentStatus]}
                  key={documentStatus}
                  label={t(documentStatus)}
                  onChange={_e =>
                    dispatch({
                      payload: documentStatus,
                      type: 'toggleStatusCheck',
                    })
                  }
                />
              );
            })}
          </Box>
        </Item>
      </Row>

      <Row sx={{ marginBottom: 0 }}>
        <Item
          sx={{
            width: 'unset',
          }}
        >
          <Label sx={{ width: '54px' }}>{t('createdAt')}</Label>
          <DateRangePicker
            onChange={createdRange =>
              dispatch({ payload: createdRange, type: 'setCreatedAtDateRange' })
            }
            value={state.createdAtDateRange}
          />
        </Item>
        <Item
          sx={{
            width: 'unset',
          }}
        >
          <Label sx={{ width: '80px' }}>{t('lastUpdated')}</Label>
          <DateRangePicker
            onChange={updatedRange =>
              dispatch({ payload: updatedRange, type: 'setUpdatedAtDateRange' })
            }
            value={state.updatedAtDateRange}
          />
        </Item>
      </Row>

      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <CustomIconButton color="primary" id="search" onClick={handleSubmit}>
        <Image alt="search icon" height={17} src="/icons/search.svg" width={17} />
      </CustomIconButton>
    </Box>
  );
}

function reducer(state: SearchFilters, action: Action): SearchFilters {
  switch (action.type) {
    case 'checkStatus': {
      return {
        ...state,
        statuses: { ...state.statuses, [action.payload]: true },
      };
    }
    case 'setCreatedAtDateRange': {
      return { ...state, createdAtDateRange: action.payload };
    }
    case 'setDocumentName':
      return { ...state, documentName: action.payload };
    case 'setUpdatedAtDateRange': {
      return { ...state, updatedAtDateRange: action.payload };
    }
    case 'toggleStatusCheck': {
      const currentValue = state.statuses[action.payload];
      return {
        ...state,
        statuses: { ...state.statuses, [action.payload]: !currentValue },
      };
    }
    case 'uncheckStatus': {
      return {
        ...state,
        statuses: { ...state.statuses, [action.payload]: false },
      };
    }
    default:
      throw new Error('Unknown action type');
  }
}

export default DocumentFilters;
