import {
  ApiCallError,
  ConflictError,
  DefinitionNotFoundError,
  DocumentNotFoundError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  OrganizationNotFoundError,
  PromptNotFoundError,
  UserNotFoundError,
} from './errors';
import type { ErrorEntity } from './types';

const _makeNotFoundError = (
  response: Response,
  entityType?: ErrorEntity,
  entityId?: number | string,
) => {
  switch (entityType) {
    case 'definition':
      return new DefinitionNotFoundError(
        `${response.status} ${response.statusText}`,
        entityId,
      );
    case 'document':
      return new DocumentNotFoundError(
        `${response.status} ${response.statusText}`,
        entityId,
      );
    case 'organization':
      return new OrganizationNotFoundError(
        `${response.status} ${response.statusText}`,
        entityId,
      );
    case 'prompt':
      return new PromptNotFoundError(
        `${response.status} ${response.statusText}`,
        entityId,
      );
    case 'user':
      return new UserNotFoundError(`${response.status} ${response.statusText}`, entityId);
    default:
      return new NotFoundError(`${response.status} ${response.statusText}`);
  }
};

const throwIfError = (
  response: Response,
  entityType?: ErrorEntity,
  entityId?: number | string,
  errorMessage?: string,
) => {
  if (!response.ok) {
    switch (response.status) {
      case 404:
        throw _makeNotFoundError(response, entityType, entityId);
      case 403:
        throw new ForbiddenError(`${response.status} ${response.statusText}`);
      case 409:
        throw new ConflictError(
          `${response.status} ${response.statusText}`,
          {},
          errorMessage,
        );
      case 500:
      case 502:
        throw new InternalServerError(`${response.status} ${response.statusText}`);
      default:
        throw new ApiCallError(`${response.status} ${response.statusText}`);
    }
  }
};

export type SearchResults<T> = {
  results: T;
  total: number;
  totalUnfiltered: number;
};

const SEARCH_QUERY_PAGE_SIZE = 500;

type SearchFunction<T> = (
  currentPage: number,
  searchPageSize: number,
) => Promise<SearchResults<T>>;

const iterateSearchPages = async <T extends any[]>(
  searchFunction: SearchFunction<T>,
  searchPageSize = SEARCH_QUERY_PAGE_SIZE,
): Promise<T> => {
  const fullResults = [];
  let currentPage = 0;
  let total;

  do {
    currentPage += 1;
    const res = await searchFunction(currentPage, searchPageSize);
    total = res.total;

    fullResults.push(...res.results);
  } while (currentPage * searchPageSize < total);

  return fullResults as T;
};

export { iterateSearchPages, throwIfError };
