import { render, screen } from '@testing-library/react';

import type { DocumentStatus } from '@/types';
import { messages } from 'messages/en';

import ScanStatusIcon from './ScanStatusIcon';

jest.mock('next-intl', () => ({
  useLocale: jest.fn().mockReturnValue('en'),
  useTranslations: (cat: string) => {
    return {
      DocumentStatus: (key: string) =>
        ({
          ...messages.DocumentStatus,
        })[key],
    }[cat];
  },
}));

describe('ScanStatusIcon', () => {
  const messageEntries = Object.entries(messages.DocumentStatus!);

  test.each(messageEntries)(
    'renders the correct icon for status "%s"',
    (status, messageObj) => {
      render(<ScanStatusIcon status={status as DocumentStatus} />);
      const tooltipIconElement = screen.queryByLabelText(messageObj);
      expect(tooltipIconElement).toBeInTheDocument();
    },
  );

  it('renders the "scanned" status icon as a default when no status is passed', () => {
    const scannedStatus = messages.DocumentStatus!.scanned;

    render(<ScanStatusIcon />);
    const tooltipIconElement = screen.queryByLabelText(scannedStatus!);
    expect(tooltipIconElement).toBeInTheDocument();
  });
});
