import type { CorrectedTableRow } from '@nstypes/templateless';
import { DateTime } from 'luxon';

import type { CorrectedItemWithId } from '@/components/ResultData/types';
import type { DocumentTypeSearchFilters, SearchFilters } from '@/types';

import {
  DATE_FORMATS,
  DONE_STATUSES,
  ERROR_STATUSES,
  PENDING_STATUSES,
} from './constants';

function extractErrorMessage(
  error: unknown,
  fallbackMessage: string = 'An unknown error occurred.',
): string {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = fallbackMessage;
  }

  return message;
}

function formatDate(date: string, format = DATE_FORMATS.DATETIME) {
  return date ? DateTime.fromISO(date).toFormat(format) : '-';
}

function removeEmptyItems(obj: ArrayLike<unknown> | { [s: string]: unknown }) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== '',
    ),
  );
}

function splitFilename(filename: string) {
  const lastDotIndex = filename.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return { baseName: filename, extension: '' };
  }

  const baseName = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex + 1);

  return { baseName, extension };
}

function transformPromptFiltersToPromptParams(filters: DocumentTypeSearchFilters) {
  const ret: { [key: string]: any } = {};
  if (filters.documentTypeName) {
    ret.name = filters.documentTypeName;
  }
  if (filters.createdBy) {
    ret.createdBy = filters.createdBy;
  }
  if (filters.createdAtDateRange[0]) {
    ret.createdAfter = filters.createdAtDateRange[0].toFormat(DATE_FORMATS.SEARCH_FILTER);
  }
  if (filters.createdAtDateRange[1]) {
    ret.createdBefore = filters.createdAtDateRange[1]
      .endOf('day')
      .toFormat(DATE_FORMATS.SEARCH_FILTER);
  }
  if (filters.updatedAtDateRange[0]) {
    ret.updatedAfter = filters.updatedAtDateRange[0].toFormat(DATE_FORMATS.SEARCH_FILTER);
  }
  if (filters.updatedAtDateRange[1]) {
    ret.updatedBefore = filters.updatedAtDateRange[1]
      .endOf('day')
      .toFormat(DATE_FORMATS.SEARCH_FILTER);
  }
  return ret;
}

function transformSearchFiltersToSearchParams(filters: SearchFilters) {
  const ret: { [key: string]: any } = {};

  if (filters.documentName) {
    ret.name = filters.documentName;
  }

  if (filters.personInCharge) {
    ret.personInCharge = filters.personInCharge;
  }

  if (filters.createdAtDateRange[0]) {
    ret.createdAfter = filters.createdAtDateRange[0].toFormat(DATE_FORMATS.SEARCH_FILTER);
  }

  if (filters.createdAtDateRange[1]) {
    ret.createdBefore = filters.createdAtDateRange[1]
      .endOf('day')
      .toFormat(DATE_FORMATS.SEARCH_FILTER);
  }

  if (filters.updatedAtDateRange[0]) {
    ret.updatedAfter = filters.updatedAtDateRange[0].toFormat(DATE_FORMATS.SEARCH_FILTER);
  }

  if (filters.updatedAtDateRange[1]) {
    ret.updatedBefore = filters.updatedAtDateRange[1]
      .endOf('day')
      .toFormat(DATE_FORMATS.SEARCH_FILTER);
  }

  const statuses = [];

  if (filters.statuses.processing) {
    statuses.push(...PENDING_STATUSES);
  }

  if (filters.statuses.done) {
    statuses.push(...DONE_STATUSES);
  }

  if (filters.statuses.error) {
    statuses.push(...ERROR_STATUSES);
  }

  if (statuses.length > 0) {
    ret.status = statuses.join(',');
  }

  // ALO-94 Hardcode scan mode to LLM in search filters, as the inital UI does not support
  // definition file scanning
  ret.scanMode = 'llm';

  return ret;
}

function validateStringData(data: unknown, source: string): string {
  if (data === null || data === undefined) {
    return '';
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return `${data}`;
  }

  if (typeof data === 'string') {
    return data;
  }

  console.warn(`Unexpected data type ${typeof data} for ${source}`);
  return '';
}

const isChangedFormValue = (prev: any, next: any): boolean => {
  return (
    prev.documentType !== next.documentType ||
    prev.fieldsPrompt?.length !== next.fieldsPrompt?.length ||
    prev.tablePrompt?.length !== next.tablePrompt?.length ||
    prev.name !== next.name ||
    prev.textualTablePrompt !== next.textualTablePrompt ||
    prev.userCustomInstructions !== next.userCustomInstructions
  );
};

function isFieldRow(
  row: CorrectedItemWithId | CorrectedTableRow,
): row is CorrectedItemWithId {
  return 'id' in row;
}

function isTableRow(
  row: CorrectedItemWithId | CorrectedTableRow,
): row is CorrectedTableRow {
  return 'row_id' in row;
}

export {
  extractErrorMessage,
  formatDate,
  isChangedFormValue,
  isFieldRow,
  isTableRow,
  removeEmptyItems,
  splitFilename,
  transformPromptFiltersToPromptParams,
  transformSearchFiltersToSearchParams,
  validateStringData,
};
