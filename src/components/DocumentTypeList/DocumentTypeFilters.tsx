'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useReducer } from 'react';

import type { User } from '@/services/api/UserServiceApi/UserServiceApiClient';
import type { AutocompleteOption, DocumentTypeSearchFilters } from '@/types';

import CustomAutocomplete from '../CustomAutocomplete/CustomAutoComplete';
import DateRangePicker from '../DateRangePicker';

const FiltersContainer = styled(Box)(() => ({
  backgroundColor: '#F4F4F4',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px 16px',
}));

const InputContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}));

const TwoInputContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '48px',
}));

const LabelInputContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  gap: '4px',
}));

const TextInput = styled('input')(() => ({
  '::placeholder': {
    color: '#C5C5C5',
  },
  backgroundColor: 'white',
  border: '1px solid #E8E8E8',
  borderRadius: '2px',
  color: '#242222',
  fontSize: '14px',
  height: '40px',
  lineHeight: '22px',
  padding: '9px 8px',
  width: '296px',
}));

const ButtonContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column-reverse',
}));

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  backgroundColor: theme.palette.primary.main,
  height: '32px',
  mr: '13px',
  width: '32px',
}));

const StyledDateRangePicker = styled(DateRangePicker)(() => ({
  '& .MuiInputBase-root': {
    '& .MuiInputBase-input': {
      fontSize: '14px',
      padding: '4px 10px 4px 10px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #E8E8E8',
    },
    backgroundColor: 'white',
    borderRadius: '2px',
    fontSize: '14px',
    height: '40px',
    lineHeight: '22px',
    padding: '9px 8px',
    width: '296px',
  },
}));

const StyledAutocomplete = styled(CustomAutocomplete)(() => ({
  '& .MuiInputBase-root': {
    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #E8E8E8',
    },
    backgroundColor: 'white',
    borderRadius: '2px',
    color: '#242222',
    fontSize: '14px',
    height: '40px',
    lineHeight: '22px',
  },
  width: '296px',
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
  | { payload: string; type: 'setCreatedBy' }
  | { payload: string; type: 'setDocumentTypeName' };

type DocumentTypeFilterProps = {
  onFiltersChanged: (newFilters: DocumentTypeSearchFilters) => Promise<void>;
  searchFilters: DocumentTypeSearchFilters;
  users: User[];
};

function DocumentTypeFilters({
  onFiltersChanged,
  searchFilters,
  users,
}: DocumentTypeFilterProps) {
  const tDocumentType = useTranslations('DocumentTypeList');
  const [state, dispatch] = useReducer(reducer, searchFilters);

  const createdByOptions = users?.map((user: User) => ({
    label: user.name,
    value: user.id,
  }));

  const handleSubmit = async () => {
    const newState = { ...state };
    if (state.documentTypeName) {
      if (state.documentTypeName.trim().length === 0) {
        newState.documentTypeName = null;
      } else {
        newState.documentTypeName = state?.documentTypeName.trim();
      }
    }

    if (state.createdBy) {
      if (state.createdBy.trim().length === 0) {
        newState.createdBy = null;
      } else {
        newState.createdBy = state?.createdBy.trim();
      }
    }
    await onFiltersChanged(newState);
  };

  return (
    <FiltersContainer>
      <InputContainer>
        <TwoInputContainer>
          <LabelInputContainer>
            <Typography
              color="#242222"
              fontSize="14px"
              fontWeight={400}
              lineHeight="22px"
              width="100px"
            >
              {tDocumentType('name')}
            </Typography>

            <TextInput
              onChange={e =>
                dispatch({ payload: e.target.value, type: 'setDocumentTypeName' })
              }
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  handleSubmit();
                }
              }}
              placeholder={tDocumentType('inputNamePlaceholder')}
              type="text"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Typography
              color="#242222"
              fontSize="14px"
              fontWeight={400}
              lineHeight="22px"
              width="100px"
            >
              {tDocumentType('createdBy')}
            </Typography>

            <StyledAutocomplete
              onChange={(e, value: AutocompleteOption | null | string) =>
                dispatch({
                  payload:
                    typeof value === 'string' ? value : value?.value?.toString() || '',
                  type: 'setCreatedBy',
                })
              }
              onKeyDownAction={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  handleSubmit();
                }
              }}
              options={createdByOptions}
              placeholder={tDocumentType('inputCreatedByPlaceholder')}
              value={createdByOptions?.find(
                (item: AutocompleteOption) => item.value?.toString() === state.createdBy,
              )}
            />
          </LabelInputContainer>
        </TwoInputContainer>

        <TwoInputContainer>
          <LabelInputContainer>
            <Typography
              color="#242222"
              fontSize="14px"
              fontWeight={400}
              lineHeight="22px"
              width="100px"
            >
              {tDocumentType('createdAt')}
            </Typography>

            <StyledDateRangePicker
              onChange={updatedRange =>
                dispatch({ payload: updatedRange, type: 'setCreatedAtDateRange' })
              }
              value={state.createdAtDateRange}
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Typography
              color="#242222"
              fontSize="14px"
              fontWeight={400}
              lineHeight="22px"
              width="100px"
            >
              {tDocumentType('updatedAt')}
            </Typography>

            <StyledDateRangePicker
              onChange={updatedRange =>
                dispatch({ payload: updatedRange, type: 'setUpdatedAtDateRange' })
              }
              value={state.updatedAtDateRange}
            />
          </LabelInputContainer>
        </TwoInputContainer>
      </InputContainer>

      <ButtonContainer>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <CustomIconButton color="primary" id="search" onClick={handleSubmit}>
          <Image alt="search icon" height={17} src="/icons/search.svg" width={17} />
        </CustomIconButton>
      </ButtonContainer>
    </FiltersContainer>
  );
}
function reducer(
  state: DocumentTypeSearchFilters,
  action: Action,
): DocumentTypeSearchFilters {
  switch (action.type) {
    case 'setCreatedAtDateRange': {
      return { ...state, createdAtDateRange: action.payload };
    }
    case 'setCreatedBy':
      return { ...state, createdBy: action.payload };
    case 'setDocumentTypeName':
      return { ...state, documentTypeName: action.payload };
    case 'setUpdatedAtDateRange': {
      return { ...state, updatedAtDateRange: action.payload };
    }
    default:
      throw new Error('Unknown action type');
  }
}
export default DocumentTypeFilters;
