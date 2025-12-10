import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import TablePagination from './TablePagination';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    return {
      'TablePagination.rowsPerPage': 'Rows per page',
    }[key];
  },
}));

describe('TablePagination Component', () => {
  const count = 100;
  const page = 1;
  const rowsPerPage = 10;
  const rowsPerPageOptions = [10, 25, 50];
  const onPageChangeMock = jest.fn();
  const onRowsPerPageChangeMock = jest.fn();

  test('renders the TablePagination component with the correct props', () => {
    render(
      <TablePagination
        count={count}
        onPageChange={onPageChangeMock}
        onRowsPerPageChange={onRowsPerPageChangeMock}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
      />,
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Rows per page', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('11–20 of 100')).toBeInTheDocument();

    expect(screen.getByLabelText('first page')).toBeInTheDocument();
    expect(screen.getByLabelText('previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('next page')).toBeInTheDocument();
    expect(screen.getByLabelText('last page')).toBeInTheDocument();
  });

  test('handles page navigation correctly', async () => {
    render(
      <TablePagination
        count={count}
        onPageChange={onPageChangeMock}
        onRowsPerPageChange={onRowsPerPageChangeMock}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
      />,
    );

    const nextButton = screen.getByLabelText('next page');
    await userEvent.click(nextButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(expect.anything(), page + 1);

    const prevButton = screen.getByLabelText('previous page');
    await userEvent.click(prevButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(expect.anything(), page - 1);

    const firstButton = screen.getByLabelText('first page');
    await userEvent.click(firstButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(expect.anything(), 0);

    const lastButton = screen.getByLabelText('last page');
    await userEvent.click(lastButton);
    expect(onPageChangeMock).toHaveBeenCalledWith(
      expect.anything(),
      Math.max(0, Math.ceil(count / rowsPerPage) - 1),
    );
  });

  test('handles row per page change correctly', async () => {
    render(
      <TablePagination
        count={count}
        onPageChange={onPageChangeMock}
        onRowsPerPageChange={onRowsPerPageChangeMock}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
      />,
    );

    const select = screen.getByRole('combobox');
    await userEvent.click(select);
    const option = screen.getByRole('option', { name: '50' });
    await userEvent.click(option);
    expect(onRowsPerPageChangeMock).toHaveBeenCalledTimes(1);
  });
});
