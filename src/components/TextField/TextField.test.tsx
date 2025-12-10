import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import TextField from './TextField';

describe('TextField', () => {
  test('renders the TextField component', () => {
    render(<TextField />);
    const textField = screen.getByRole('textbox');
    expect(textField).toBeInTheDocument();
  });

  test('displays the provided value', () => {
    const value = 'Hello, world!';
    render(<TextField value={value} />);
    const textField = screen.getByRole('textbox');
    expect(textField).toHaveValue(value);
  });

  test('calls the onChange callback when input changes', () => {
    const onChange = jest.fn();
    render(<TextField onChange={onChange} />);
    const textField = screen.getByRole('textbox');
    const inputValue = 'New Value';
    fireEvent.change(textField, { target: { value: inputValue } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: inputValue,
        }),
      }),
    );
  });
});
