import type { Page, RawDocument } from '@netsmile/page-edit-component';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SnackbarMessage } from 'notistack';
import React from 'react';

import { DOCUMENT_STATUS, TABLE_ROW_DETECTION_STATUS } from '@/constants';
import { ConflictError } from '@/services/api/errors';

import Document from './Document';

const { CANCELLED, DONE, ERROR, PENDING } = TABLE_ROW_DETECTION_STATUS;

const mockDefinition = { id: '55' };
const mockDocumentId = '99';
const mockDocumentPageId = '88';
const mockTable = { xmax: 0.1, xmin: 0.05, ymax: 0.1, ymin: 0.05 };
const mockRow1 = { xmax: 0.1, xmin: 0.75, ymax: 0.1, ymin: 0.05 };
const mockTableId = '77';
const mockActiveRequestId = 'abc';
const mockSearchResults = [{ results: [{ id: '100' }, { id: '101' }, { id: '102' }] }];
const mockPrompts = [
  {
    createdAt: '2025-01-09T04:53:13.512Z',
    createdBy: null,
    documentType: '支払通知書',
    extractTable: true,
    fieldsPrompt: [
      {
        isPreset: true,
        item: 'タイトル',
      },
      {
        isPreset: true,
        item: '複数行記載されている場合には1行にする',
      },
      {
        isPreset: true,
        item: '楽曲',
      },
      {
        isPreset: true,
        item: '税込価格',
      },
      {
        isPreset: true,
        item: '印税単価',
      },
      {
        isPreset: true,
        item: '印税合計',
      },
    ],
    id: '965',
    name: '支払通知書',
    nameJpn: null,
    organizationId: 23,
    shortName: null,
    shortNameJpn: null,
    systemPrompt:
      '- 出力はJSON形式で\n- JSON以外のテキストは含めないで\n- 一字一句間違わずにテキストを抽出してください\n- 勝手に文章を作らないでください\n- 値が見つからなければ、空文字（"）で補完して\n- 項目「明細表」の値は配列にして',
    textualTablePrompt: '- 明細表',
    updatedAt: '2025-01-27T05:32:46.982Z',
    userCustomInstructions:
      '出力時の注意点：\n- 一字一句漏らさず出力して\n- 表の全行について上記フォーマットでデータを抽出',
  },
];
const mockDocument = {
  id: mockDocumentId,
  name: 'scanned.pdf',
} as unknown as RawDocument;

const mockPageEditComponentProps = jest.fn();
const mockGetTableRowDetectionStatus = jest.fn();
const mockSavePageCorrections = jest.fn();
const mockRequestTableRowDetection = jest.fn();
const mockCancelTableRowDetection = jest.fn();
const mockDeleteDocument = jest.fn();
const mockExportDocument = jest.fn();
const mockUpdateDocument = jest.fn();
const mockRouterPush = jest.fn();
const mockEnqueueSnackbar = jest.fn();
const mockUseRef = jest.fn().mockReturnValue({ current: null });

const verifyReturnValue = jest.fn();

jest.mock('../../services/api', () => ({
  getApiClient: jest.fn(() => ({
    cancelTableRowDetection: mockCancelTableRowDetection,
    deleteDocument: mockDeleteDocument,
    exportDocument: mockExportDocument,
    getTableRowDetectionStatus: mockGetTableRowDetectionStatus,
    requestTableRowDetection: mockRequestTableRowDetection,
    savePageCorrections: mockSavePageCorrections,
    updateDocument: mockUpdateDocument,
  })),
}));

jest.mock('../../utils', () => ({
  extractErrorMessage: jest.fn(
    (error: { message: string }) => error.message || 'An error occurred',
  ),
}));

jest.mock('../../hooks', () => ({
  useWindowSize: jest.fn(() => ({
    height: 768,
    width: 1024,
  })),
}));

jest.mock('notistack', () => ({
  enqueueSnackbar: (message: SnackbarMessage) => mockEnqueueSnackbar(message),
  SnackbarProvider: jest.fn(),
  VariantType: jest.fn(),
}));

jest.mock('@netsmile/page-edit-component', () => ({
  __esModule: true,
  default: (props: any) => {
    mockPageEditComponentProps(props);

    return (
      <div data-testid="mock-page-edit-component">
        <button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            const res = await props.onSave(mockDocumentId, {
              pages: [
                {
                  correctedItems: [],
                  correctedTables: [],
                  id: mockDocumentPageId,
                },
              ],
            });
            verifyReturnValue(res);
          }}
          type="button"
        >
          Save
        </button>
        <button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            const res = await props.onRequestRowDetection(
              mockDocumentId,
              mockDocumentPageId,
              mockTable,
              [mockRow1],
              mockTableId,
            );
            verifyReturnValue(res);
          }}
          type="button"
        >
          Request Detection
        </button>
        <button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            const res = await props.onCancelRowDetection(
              mockDocumentId,
              mockDocumentPageId,
            );
            verifyReturnValue(res);
          }}
          type="button"
        >
          Cancel Detection
        </button>
        <button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            const res = await props.pollRowDetectionResults();
            verifyReturnValue(res);
          }}
          type="button"
        >
          Poll
        </button>
        <div data-request-status={props.activeRequestStatus}>Request Status</div>
      </div>
    );
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock('../../providers/global-data-store-provider', () => ({
  useGlobalDataStore: jest.fn(() => ({
    definitions: [mockDefinition],
    page: 0,
    prompts: mockPrompts,
    searchResults: mockSearchResults,
  })),
}));

jest.mock('../../providers/document-data-store-provider', () => ({
  useDocumentDataStore: jest.fn(() => ({
    rawDocument: mockDocument,
  })),
}));

jest.mock('next-intl', () => ({
  useLocale: jest.fn().mockReturnValue('en'),
  useTranslations: (cat: string) => {
    return {
      Actions: (key: string) => ({})[key],
      Document: (key: string) =>
        ({
          deleteFailure: 'Failed deleting',
          documentConfirm: 'Confirm',
          documentRemoveConfirm: 'Remove Confirm',
          exportFailure: 'Failed exporting',
          saveFailure: 'Failed saving',
          saveSuccess: 'Saved',
        })[key],
      DocumentRescan: (key: string) =>
        ({
          rescanWholeDocument: 'rescanWholeDocument',
        })[key],
      DocumentStatus: (key: string) => ({})[key],
      Download: (key: string) =>
        ({
          download: 'Download',
        })[key],
      Errors: (key: string) =>
        ({
          connectionError: 'Connection error: {errorMessage}',
        })[key],
      Feedback: (key: string) =>
        ({
          title: 'Please provide your feedback',
        })[key],
      TableRowDetection: (key: string) =>
        ({
          alreadyCancelled:
            'This request has already been cancelled, or it has completed',
          cancelled: 'Request successfully cancelled',
          detectionResultsEmpty: 'No rows were detected',
          done: 'Row detection completed',
          failure: 'An error occured while detecting rows: {errorMessage}',
        })[key],
    }[cat];
  },
}));

describe('Document Component', () => {
  const documentPages = [
    {
      correctedItems: [],
      extractedTables: [],
      id: '11',
    },
    {
      correctedItems: [],
      extractedTables: [],
      id: '12',
    },
  ];

  const rawDocument = {
    blobId: 'aaa-bbb-ccc',
    confirmed: false,
    createdAt: '2024-11-05T06:43:22.412Z',
    createdBy: '12',
    definitionDetectionStatus: null,
    definitionId: null,
    definitionIdsByPage: ['89', '89'],
    embeddedTextDocumentResult: { formatVersion: '1.6' },
    id: '100',
    name: 'some_document.PDF',
    organizationId: '1',
    origin: 'asralpha',
    originalFileUrl: 'blob-service/the-original-file-url',
    pages: documentPages as unknown as Page[],
    pdfConversionMethod: 'standard',
    personInCharge: 'some guy',
    processedAt: '2024-11-05T06:43:33.268Z',
    processingRequestAt: '2024-11-05T06:43:22.666Z',
    scannedAt: '2024-11-05T06:43:52.303Z',
    scanRequestAt: '2024-11-05T06:43:33.271Z',
    status: DOCUMENT_STATUS.SCANNED,
    updatedAt: '2024-11-05T06:43:52.303Z',
  };

  it('renders page-edit-component with appropriate properties', () => {
    render(<Document data={rawDocument} />);

    expect(screen.getByTestId('mock-page-edit-component')).toBeInTheDocument();

    expect(mockPageEditComponentProps).toHaveBeenCalledWith(
      expect.objectContaining({
        activeRequestStatus: null,
        definitions: [mockDefinition],
        enableTableSupport: true,
        licenseKey: expect.any(String),
        locale: 'en',
        onCancelRowDetection: expect.any(Function),
        onNavigate: expect.any(Function),
        onRequestRowDetection: expect.any(Function),
        onSave: expect.any(Function),
        pollRowDetectionResults: expect.any(Function),
        rawDocument,
        setActiveRequestStatus: expect.any(Function),
      }),
    );
  });

  describe('handlePollRowDetectionResults', () => {
    it(`should return an empty array
        when pollResultsForDocument reference is empty`, async () => {
      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Poll'));

      await waitFor(() => {
        expect(verifyReturnValue).toHaveBeenCalledWith([]);
      });
    });

    it(`should call getTableRowDetectionStatus and return an empty array
        when pollResultsForDocument reference is not empty
        and table row detection status is ${PENDING}`, async () => {
      const mockRefValue = {
        current: {
          documentId: mockDocumentId,
          documentPageId: mockDocumentPageId,
        },
      };
      jest.spyOn(React, 'useRef').mockReturnValueOnce(mockRefValue);

      mockGetTableRowDetectionStatus.mockResolvedValueOnce({
        detectionResults: [],
        errorMessage: '',
        status: PENDING,
        tableId: '',
      });

      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Poll'));

      await waitFor(() => {
        expect(mockGetTableRowDetectionStatus).toHaveBeenCalledWith(
          mockDocumentId,
          mockDocumentPageId,
        );
        expect(verifyReturnValue).toHaveBeenCalledWith([]);
      });
    });

    it(`should show warning,
        set active request status to ${DONE},
        and return an empty array
        when pollResultsForDocument reference is not empty
        and detectionResults or tableId are missing`, async () => {
      const mockRefValue = {
        current: {
          documentId: mockDocumentId,
          documentPageId: mockDocumentPageId,
        },
      };
      jest.spyOn(React, 'useRef').mockReturnValue(mockRefValue);

      mockGetTableRowDetectionStatus.mockResolvedValueOnce({
        detectionResults: [],
        errorMessage: '',
        status: DONE,
        tableId: '',
      });

      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Poll'));

      await waitFor(() => {
        expect(verifyReturnValue).toHaveBeenCalledWith([]);
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
          message: 'No rows were detected',
          variant: 'warning',
        });
        const requestStatus = screen
          .getByText('Request Status')
          .getAttribute('data-request-status');
        expect(requestStatus).toEqual(DONE);
      });
    });

    const baseDetectionResults = {
      detectionResults: [{}],
      errorMessage: '',
      tableId: 'abc',
    };

    const detectionResults = [
      {
        message: 'Row detection completed',
        result: { ...baseDetectionResults, status: DONE },
        variant: 'success',
      },
      {
        message: 'This request has already been cancelled, or it has completed',
        result: { ...baseDetectionResults, status: CANCELLED },
        variant: 'warning',
      },
      {
        message: 'An error occured while detecting rows: {errorMessage}',
        result: { ...baseDetectionResults, status: ERROR },
        variant: 'error',
      },
      {
        message: 'An error occured while detecting rows: {errorMessage}',
        result: { ...baseDetectionResults, status: 'default' },
        variant: 'error',
      },
    ];

    for (const testCase of detectionResults) {
      it(`should set snackbar to ${testCase.variant}
        set active request status to ${testCase.result.status}
        and return detection results
        when detection results and table ID are returned`, async () => {
        const mockRefValue = {
          current: {
            documentId: mockDocumentId,
            documentPageId: mockDocumentPageId,
          },
        };
        jest.spyOn(React, 'useRef').mockReturnValue(mockRefValue);

        mockGetTableRowDetectionStatus.mockResolvedValueOnce(testCase.result);

        render(<Document data={rawDocument} />);

        // Initial call, starts poll
        fireEvent.click(screen.getByText('Poll'));

        // Timeout call, after poll has resolved
        await act(async () => {
          await new Promise(r => {
            setTimeout(r, 100);
          });
        });
        fireEvent.click(screen.getByText('Poll'));

        await waitFor(() => {
          const requestStatus = screen
            .getByText('Request Status')
            .getAttribute('data-request-status');
          expect(requestStatus).toEqual(testCase.result.status);

          expect(verifyReturnValue).toHaveBeenCalledWith(
            baseDetectionResults.detectionResults,
          );
          expect(verifyReturnValue).toHaveBeenCalledWith([]);

          expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
            message: testCase.message,
            variant: testCase.variant,
          });
        });
      });
    }
  });

  describe('handleSave', () => {
    it(`should call savePageCorrections with correction data,
        show snackbar with success message,
        and return OK response`, async () => {
      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockSavePageCorrections).toHaveBeenCalledWith(
          mockDocumentId,
          mockDocumentPageId,
          {
            correctedFields: [],
            correctedTables: [],
          },
        );
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
          message: 'Saved',
          variant: 'success',
        });
        expect(verifyReturnValue).toHaveBeenCalledWith({ ok: true });
      });
    });

    it(`should show snackbar with error message and return error response
        when error occurs`, async () => {
      mockSavePageCorrections.mockRejectedValueOnce('bad');
      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
          message: 'Failed saving: An error occurred',
          variant: 'error',
        });
        expect(verifyReturnValue).toHaveBeenCalledWith({
          errors: ['An error occurred'],
          ok: false,
        });
      });
    });
  });

  describe('handleRequestTableRowDetection', () => {
    it(`should call requestTableRowDetection
        and return active request ID`, async () => {
      mockUseRef.mockReturnValueOnce({
        current: {
          documentId: mockDocumentId,
          documentPageId: mockDocumentPageId,
        },
      });
      mockRequestTableRowDetection.mockResolvedValueOnce({
        activeRowDetectionRequestId: mockActiveRequestId,
      });

      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Request Detection'));

      await waitFor(() => {
        expect(mockRequestTableRowDetection).toHaveBeenCalledWith(
          mockDocumentId,
          mockDocumentPageId,
          {
            rows: [{ boxId: 'row_0001', ...mockRow1 }],
            table: mockTable,
            tableId: mockTableId,
          },
        );

        expect(verifyReturnValue).toHaveBeenCalledWith({
          requestId: mockActiveRequestId,
        });
        expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
      });
    });

    it(`should show snackbar with error message once
        and return error message
        when table row detection is unsuccessful`, async () => {
      mockUseRef.mockReturnValueOnce({
        current: {
          documentId: mockDocumentId,
          documentPageId: mockDocumentPageId,
        },
      });
      mockRequestTableRowDetection.mockRejectedValueOnce('bad');

      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Request Detection'));

      fireEvent.click(screen.getByText('Request Detection'));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
          message: 'An error occured while detecting rows: {errorMessage}',
          variant: 'error',
        });
        expect(verifyReturnValue).toHaveBeenCalledWith({
          error: 'An error occurred',
          requestId: '',
        });
      });
    });
  });

  describe('handleCancelRowDetection', () => {
    it(`should call cancelTableRowDetection with active request ID
      and show snackbar with success message once`, async () => {
      mockRequestTableRowDetection.mockResolvedValueOnce({
        activeRowDetectionRequestId: mockActiveRequestId,
      });

      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Request Detection'));

      mockUseRef.mockReturnValueOnce({
        current: {
          documentId: mockDocumentId,
          documentPageId: mockDocumentPageId,
        },
      });

      await act(async () => {
        await new Promise(r => {
          setTimeout(r, 100);
        });
      });

      fireEvent.click(screen.getByText('Cancel Detection'));

      await waitFor(() => {
        expect(mockCancelTableRowDetection).toHaveBeenCalledWith(
          mockDocumentId,
          mockDocumentPageId,
          mockActiveRequestId,
        );
        expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
          message: 'Request successfully cancelled',
          variant: 'success',
        });
      });
    });

    it(`should show snackbar with warning message once
        when a ConflictError occurs`, async () => {
      mockCancelTableRowDetection.mockRejectedValueOnce(
        new ConflictError('bad', {}, 'detectionAlreadyCompleted'),
      );

      const mockRefValue = {
        current: {
          documentId: mockDocumentId,
          documentPageId: mockDocumentPageId,
        },
      };
      jest.spyOn(React, 'useRef').mockReturnValue(mockRefValue);

      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Cancel Detection'));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
          message: 'This request has already been cancelled, or it has completed',
          variant: 'warning',
        });
      });
    });

    it(`should show snackbar with error message once
        when a non-ConflictError error occurs`, async () => {
      mockCancelTableRowDetection.mockRejectedValueOnce('bad');

      const mockRefValue = {
        current: {
          documentId: mockDocumentId,
          documentPageId: mockDocumentPageId,
        },
      };
      jest.spyOn(React, 'useRef').mockReturnValue(mockRefValue);

      render(<Document data={rawDocument} />);

      fireEvent.click(screen.getByText('Cancel Detection'));

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
          message: 'An error occured while detecting rows: {errorMessage}',
          variant: 'error',
        });
      });
    });
  });
});
