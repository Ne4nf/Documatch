import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterLuxon } from '@mui/x-date-pickers-pro/AdapterLuxon';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import DateRangePicker from './DateRangePicker';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    return {
      'Shared.dateRangePlaceholder': 'From - To',
    }[key];
  },
}));

describe('DateRangePicker Component', () => {
  test('Renders the DateRangePicker component with null value, and placeholder is displayed', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <DateRangePicker onChange={() => {}} value={[null, null]} />
      </LocalizationProvider>,
    );

    const inputElement = screen.getByPlaceholderText('From - To');
    expect(inputElement).toBeInTheDocument();
  });

  test('Calendar is render when input pressed', async () => {
    render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <DateRangePicker onChange={() => {}} value={[null, null]} />
      </LocalizationProvider>,
    );

    const inputElement = screen.getByRole('textbox');
    await userEvent.click(inputElement);
    expect(screen.getByRole('tooltip')).toBeVisible();
  });

  test('calls the onChange callback when select date', async () => {
    const onChange = jest.fn();
    render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <DateRangePicker onChange={onChange} value={[null, null]} />
      </LocalizationProvider>,
    );

    const inputElement = screen.getByRole('textbox');
    await userEvent.click(inputElement);
    const selectedDate = screen.getAllByText('15');
    await userEvent.click(selectedDate[0]!);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
