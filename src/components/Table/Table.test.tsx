import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Table from './Table';

describe('Table Component', () => {
  function setWindowSize({ height, width }: { height: number; width: number }) {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: width,
      writable: true,
    });

    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: height,
      writable: true,
    });
  }

  beforeEach(() => {
    setWindowSize({ height: 1000, width: 1000 });
  });

  const columns = [
    { id: 'id', label: 'ID' } as const,
    { id: 'name', label: 'Name', sortable: true, sortName: 'name' } as const,
  ];

  const rows = [{ id: '1', name: 'John' } as const, { id: '2', name: 'Doe' } as const];

  test('renders the table header correctly', () => {
    render(<Table columns={columns} id="test-table" rows={rows} />);

    columns.forEach(column => {
      const columnHeader = screen.getByText(column.label);
      expect(columnHeader).toBeInTheDocument();
    });
  });

  test('renders the table rows correctly', () => {
    render(<Table columns={columns} id="test-table" rows={rows} />);

    rows.forEach(row => {
      columns.forEach(column => {
        const cell = screen.getByText(row[column.id]);
        expect(cell).toBeInTheDocument();
      });
    });
  });

  test('handles sorting when clicking on a sortable column header', async () => {
    const onSortMock = jest.fn();
    render(
      <Table
        columns={columns}
        id="test-table"
        onSortingChange={onSortMock}
        rows={rows}
      />,
    );

    const sortableColumn = columns.find(col => col.sortable);
    if (sortableColumn) {
      const columnHeader = screen.getByText(sortableColumn.label);
      await userEvent.click(columnHeader);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(onSortMock).toHaveBeenCalledWith(sortableColumn);
    }
  });

  test('displays loading indicator when loading prop is true', () => {
    render(<Table columns={columns} id="test-table" loading rows={rows} />);

    const loadingIndicator = screen.getByRole('progressbar');
    expect(loadingIndicator).toBeInTheDocument();
  });
});
