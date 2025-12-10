import type { DateTime } from 'luxon';

import type { DOCUMENT_STATUS } from './constants';

export interface AutocompleteOption {
  label: string;
  value: number | string;
}

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export interface DocumentTypeSearchFilters {
  createdAtDateRange: [DateTime | null, DateTime | null];
  createdBy: null | string;
  documentTypeName: null | string;
  updatedAtDateRange: [DateTime | null, DateTime | null];
}

export interface Option {
  label: string;
  value: string;
}

export interface SearchFilters {
  createdAtDateRange: [DateTime | null, DateTime | null];
  documentName: null | string;
  personInCharge: null | string;
  statuses: { [key: string]: boolean };
  updatedAtDateRange: [DateTime | null, DateTime | null];
}
