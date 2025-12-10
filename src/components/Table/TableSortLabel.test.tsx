import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import TableSortLabel from './TableSortLabel';

describe('TableSortLabel', () => {
  it('renders correctly when not active', () => {
    render(
      <TableSortLabel active={false} onClick={() => {}}>
        Sort Label
      </TableSortLabel>,
    );

    expect(screen.getByText('Sort Label')).toBeInTheDocument();
    expect(screen.getByTestId('ArrowUpwardSharpIcon')).toHaveStyle({
      color: '#ffffff',
    });
    expect(screen.getByTestId('ArrowDownwardSharpIcon')).toHaveStyle({
      color: '#ffffff',
    });
  });

  it('renders correctly when active and ascending', () => {
    render(
      <TableSortLabel active direction="asc" onClick={() => {}}>
        Sort Label
      </TableSortLabel>,
    );

    expect(screen.getByTestId('ArrowUpwardSharpIcon')).toHaveStyle({
      color: '#000000',
    });
    expect(screen.getByTestId('ArrowDownwardSharpIcon')).toHaveStyle({
      color: '#ffffff',
    });
  });

  it('renders correctly when active and descending', () => {
    render(
      <TableSortLabel active direction="desc" onClick={() => {}}>
        Sort Label
      </TableSortLabel>,
    );

    expect(screen.getByTestId('ArrowUpwardSharpIcon')).toHaveStyle({
      color: '#ffffff',
    });
    expect(screen.getByTestId('ArrowDownwardSharpIcon')).toHaveStyle({
      color: '#000000',
    });
  });

  it('calls onClick handler when clicked', () => {
    const onClickMock = jest.fn();
    render(
      <TableSortLabel active direction="asc" onClick={onClickMock}>
        Sort Label
      </TableSortLabel>,
    );

    fireEvent.click(screen.getByText('Sort Label'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
