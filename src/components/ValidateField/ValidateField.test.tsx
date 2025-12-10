import { render } from '@testing-library/react';

import ValidateField from './ValidateField';

describe('ValidateField component', () => {
  it('renders without errors', () => {
    const { getByText } = render(
      <ValidateField error={false} helperText="">
        <div>Child component</div>
      </ValidateField>,
    );

    expect(getByText('Child component')).toBeInTheDocument();
  });

  it('scrolls to helper text on error', () => {
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    render(
      <ValidateField error helperText="Helper text">
        <div>Child component</div>
      </ValidateField>,
    );
    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: 'smooth',
        top: expect.any(Number),
      }),
    );
    expect(scrollToSpy).toHaveBeenCalledTimes(1);
  });
});
