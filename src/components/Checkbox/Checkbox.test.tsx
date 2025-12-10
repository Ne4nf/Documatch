import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox } from '@/components/Checkbox';

describe('When using the checkbox module', () => {
  test('checked prop is true, HTML element state is also true', () => {
    render(<Checkbox checked label="Test Label" onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', true);
  });

  test.failing('When clicking label, checked state is changed', async () => {
    render(<Checkbox checked={false} label="Test Label" onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', false);
    const checkboxLabel = screen.getByText('Test Label');
    await userEvent.click(checkboxLabel);
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', true);
  });

  test('when clicked, onChange is called', async () => {
    const mockOnChange = jest.fn();
    render(<Checkbox checked={false} label="Test Label" onChange={mockOnChange} />);
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
