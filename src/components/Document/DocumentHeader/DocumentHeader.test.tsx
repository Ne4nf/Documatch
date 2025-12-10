import type { RawDocument } from '@netsmile/page-edit-component';
import { fireEvent, render, screen } from '@testing-library/react';

import { DocumentHeader } from './DocumentHeader';

const mockDocumentId = 101;
const mockDocument = {
  id: mockDocumentId,
  name: 'scanned.pdf',
} as unknown as RawDocument;

const mockDelete = jest.fn();
const mockExportDocument = jest
  .fn()
  .mockReturnValue(new Blob(['test content'], { type: 'text/plain' }));

jest.mock('../../../services/api', () => ({
  getApiClient: jest.fn(() => ({
    deleteDocument: mockDelete,
    exportDocument: mockExportDocument,
  })),
}));

const mockSearchResults = [
  { results: [{ id: '1' }, { id: '2' }] },
  { results: [{ id: '3' }, { id: '4' }] },
];

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

jest.mock('../../../providers/global-data-store-provider', () => ({
  useGlobalDataStore: jest.fn(() => ({
    prompts: mockPrompts,
    searchResults: mockSearchResults,
  })),
}));

jest.mock('../../../providers/document-data-store-provider', () => ({
  useDocumentDataStore: jest.fn(() => ({
    rawDocument: mockDocument,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next-intl', () => ({
  useLocale: jest.fn().mockReturnValue('en'),
  useTranslations: (cat: string) => {
    return {
      Actions: (key: string) =>
        ({
          delete: 'Del',
        })[key],
      Document: (key: string) =>
        ({
          documentExport: 'documentExport',
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
      Feedback: (key: string) =>
        ({
          title: 'Please provide your feedback',
        })[key],
    }[cat];
  },
}));

describe('DocumentHeader component', () => {
  describe('Clicking the delete button', () => {
    test('Confirmation prompt opens, clicking delete calls api', () => {
      render(<DocumentHeader data={mockDocument} setLoading={() => {}} />);

      const deleteButton = screen.getByRole('button', { name: 'Del' });

      fireEvent.click(deleteButton);

      const confirmDeleteButton = screen.getByTestId('confirmDelete');

      fireEvent.click(confirmDeleteButton);

      expect(mockDelete).toHaveBeenCalledWith(mockDocumentId);
    });
  });
});
