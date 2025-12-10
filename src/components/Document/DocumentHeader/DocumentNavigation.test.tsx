import { fireEvent, render, screen } from '@testing-library/react';

import DocumentNavigation from './DocumentNavigation';

const mockSearchResults = [
  { results: [{ id: '1' }, { id: '2' }] },
  { results: [{ id: '3' }, { id: '4' }] },
];

let mockPage = 0;
const mockRouterPush = jest.fn();
const mockSetPage = jest.fn();
const mockSearchDocuments = jest.fn();
const mockFilters = {
  createdAtDateRange: [],
  documentName: null,
  personInCharge: null,
  statuses: {
    done: null,
    error: null,
    processing: null,
  },
  updatedAtDateRange: [],
};
const mockSetSearchResults = jest.fn();

jest.mock('../../../services/api', () => ({
  getApiClient: jest.fn(() => ({
    searchDocuments: mockSearchDocuments,
  })),
}));

jest.mock('next-intl', () => ({
  useLocale: jest.fn().mockReturnValue('en'),
  useTranslations: (cat: string) => {
    return {
      Document: (key: string) =>
        ({
          navigationNextDocument: 'Next',
          navigationPreviousDocument: 'Prev',
        })[key],
    }[cat];
  },
}));

jest.mock('../../../providers/global-data-store-provider', () => ({
  useGlobalDataStore: jest.fn(() => ({
    page: mockPage,
    rowsPerPage: 2,
    searchFilters: mockFilters,
    searchResults: mockSearchResults,
    setPage: mockSetPage,
    setSearchResults: mockSetSearchResults,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe('DocumentNavigation', () => {
  test(`For first document, previous button is disabled,
        clicking next button navigates to the next id.`, () => {
    const mockId = '1';
    render(<DocumentNavigation documentId={mockId} setLoading={jest.fn()} />);

    const prevButton = screen.getByRole('button', { name: 'Prev' });
    expect(prevButton).toBeDisabled();

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    expect(mockRouterPush).toHaveBeenCalledWith('/document/2');
  });

  test('For last document, next button is disabled', () => {
    const mockId = '4';
    mockPage = 1;
    render(<DocumentNavigation documentId={mockId} setLoading={jest.fn()} />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeDisabled();
  });

  test('Clicking prev button from second page loads the 1st page', () => {
    const mockId = '3';
    mockSearchDocuments.mockReturnValue(mockSearchResults[0]);
    mockPage = 1;
    render(<DocumentNavigation documentId={mockId} setLoading={jest.fn()} />);

    const prevButton = screen.getByRole('button', { name: 'Prev' });
    fireEvent.click(prevButton);
    expect(mockRouterPush).toHaveBeenCalledWith('/document/2');
  });
});
