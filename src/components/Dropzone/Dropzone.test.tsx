import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { TEST_IDS } from '../../constants';
import Dropzone from './Dropzone';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    return key;
  },
}));

jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({}),
  }),
  GlobalWorkerOptions: {
    workerSrc: jest.fn(),
  },
}));

describe('When using the Dropzone component', () => {
  const mockProps = {
    isMultiple: true,
    onDelete: jest.fn(),
    onDrop: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload area', () => {
    render(<Dropzone {...mockProps} />);
    const uploadArea = screen.getByTestId(TEST_IDS.DROPZONE.DROP_BOX);

    expect(uploadArea).toBeInTheDocument();
  });

  it('onDrop callback when files are dropped accepted file', async () => {
    render(<Dropzone {...mockProps} />);
    const uploadArea = screen.getByTestId(TEST_IDS.DROPZONE.DROP_BOX);
    const file = new File(['dummy content'], 'test.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(uploadArea, 'files', {
      value: [file],
    });

    fireEvent.drop(uploadArea);
    await waitFor(() => {
      expect(mockProps.onDrop).toHaveBeenCalledWith([file]);
    });
  });

  it('onDrop callback when files are dropped after that delete file', async () => {
    render(<Dropzone {...mockProps} />);
    const uploadArea = screen.getByTestId(TEST_IDS.DROPZONE.DROP_BOX);
    const file = new File(['dummy content'], 'test.pdf', {
      type: 'application/pdf',
    });
    const file1 = new File(['dummy content'], 'test1.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(uploadArea, 'files', {
      value: [file, file1],
    });

    fireEvent.drop(uploadArea);
    await waitFor(() => {
      expect(mockProps.onDrop).toHaveBeenCalledWith([file, file1]);
      expect(mockProps.onDelete).toHaveBeenCalledTimes(0);
    });

    const fileComponent = screen.getByText('test.pdf');

    fireEvent.click(fileComponent);
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
    expect(mockProps.onDelete).toHaveBeenCalledWith([file1]);
  });

  it('onDelete, if not exist a file remove error', async () => {
    const props = {
      ...mockProps,
      isMultiple: false,
    };
    render(<Dropzone {...props} />);
    const uploadArea = screen.getByTestId(TEST_IDS.DROPZONE.DROP_BOX);
    const file = new File(['dummy content'], 'test.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(uploadArea, 'files', {
      value: [file],
    });

    fireEvent.drop(uploadArea);
    await waitFor(() => {
      expect(mockProps.onDrop).toHaveBeenCalledTimes(1);
      expect(mockProps.onDelete).toHaveBeenCalledTimes(0);
    });

    const closeButtons = screen.getAllByTestId(TEST_IDS.DROPZONE.DELETE_ITEM);
    fireEvent.click(closeButtons[0]!);
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });
});
