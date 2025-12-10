import { Box } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PropertiesEditPopover } from './PropertiesEditPopover';

jest.mock('next-intl', () => ({
  useLocale: jest.fn().mockReturnValue('en'),
  useTranslations: () => () => {
    return 'translated';
  },
}));

describe('PropertiesEditPopover', () => {
  const mockOnSave = jest.fn();
  const mockOnCloseWithoutSave = jest.fn();
  const buttonLabel = 'Menu';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('buttonLabel is shown and toggles menu when clicked', async () => {
    render(
      <PropertiesEditPopover buttonLabel={buttonLabel} onSave={mockOnSave}>
        <Box />
      </PropertiesEditPopover>,
    );
    expect(screen.queryByTestId('popover-body')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(buttonLabel));
    expect(screen.getByTestId('popover-body')).toBeVisible();

    fireEvent.click(screen.getByText(buttonLabel));
    await waitFor(() =>
      expect(screen.queryByTestId('popover-body')).not.toBeInTheDocument(),
    );
  });

  it('When save button clicked, onSave is called', () => {
    render(
      <PropertiesEditPopover
        buttonLabel={buttonLabel}
        onCloseWithoutSave={mockOnCloseWithoutSave}
        onSave={mockOnSave}
      >
        <Box />
      </PropertiesEditPopover>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const save = screen.getByTestId('popover-save-button');
    fireEvent.click(save);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnCloseWithoutSave).toHaveBeenCalledTimes(0);
  });

  it('When closed without saving, onCloseWithoutSave is called', async () => {
    const user = userEvent.setup();

    render(
      <PropertiesEditPopover
        buttonLabel={buttonLabel}
        onCloseWithoutSave={mockOnCloseWithoutSave}
        onSave={mockOnSave}
      >
        <Box />
      </PropertiesEditPopover>,
    );

    fireEvent.click(screen.getByText(buttonLabel));
    expect(screen.getByTestId('popover-body')).toBeVisible();

    await user.keyboard('{Esc}');
    await waitFor(() =>
      expect(screen.queryByTestId('popover-body')).not.toBeInTheDocument(),
    );

    expect(mockOnCloseWithoutSave).toHaveBeenCalledTimes(1);
  });

  it('Save button is disabled by prop', () => {
    render(
      <PropertiesEditPopover
        buttonLabel={buttonLabel}
        disableSaveButton
        onSave={mockOnSave}
      >
        <Box />
      </PropertiesEditPopover>,
    );

    fireEvent.click(screen.getByText(buttonLabel));
    expect(screen.getByTestId('popover-body')).toBeVisible();
    const save = screen.getByTestId('popover-save-button');
    expect(save).toBeDisabled();
  });
});
