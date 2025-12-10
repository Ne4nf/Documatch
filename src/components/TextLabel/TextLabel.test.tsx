import { render } from '@testing-library/react';
import React from 'react';

import type { TextLabelProps } from './TextLabel';
import TextLabel from './TextLabel';

describe('When using the TextLabel component', () => {
  let mockProps: TextLabelProps;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProps = {
      children: 'Test Text',
    };
  });

  it('renders text without required indicator by default', () => {
    const { getByText } = render(<TextLabel {...mockProps} />);
    const textElement = getByText('Test Text');

    expect(textElement).toBeInTheDocument();
  });

  it('renders text with required indicator when isRequired is true', () => {
    mockProps.isRequired = true;
    const { getByAltText, getByText } = render(<TextLabel {...mockProps} />);
    const textElement = getByText('Test Text');
    const required = getByAltText('required');

    expect(textElement).toBeInTheDocument();
    expect(required).toBeInTheDocument();
  });
});
