import type { RawDocument } from '@netsmile/page-edit-component';
import type { BoundingBox, Definition, Prompt, PromptItem } from '@nstypes/templateless';

import type { MimeType } from '@/constants';
import { MIME_TYPES } from '@/constants';
import type {
  ApiConfig,
  Method,
  PdfConversionMethod,
  ScanMode,
  SearchParams,
} from '@/services/api/types';
import {
  iterateSearchPages,
  type SearchResults,
  throwIfError,
} from '@/services/api/utils';

export interface BoundingBoxWithId extends BoundingBox {
  boxId: string;
}
export type DefinitionSearchResults = SearchResults<Definition[]>;

export interface DocumentGroupItem {
  pages: number[]; // This refers to page id, not page number
  promptId: number;
}

export type DocumentSearchResults = SearchResults<RawDocument[]>;

export interface HealthcheckResponse {
  status: string;
}

export interface PromptCreatePayload {
  documentType: string;
  extractTable?: boolean;
  fieldsPrompt?: PromptItem[];
  name: string;
  nameJpn?: null | string;
  shortName?: null | string;
  shortNameJpn?: null | string;
  systemPrompt?: null | string;
  tablePrompt?: null | PromptItem[];
  textualTablePrompt?: null | string;
  userCustomInstructions?: null | string;
}

export type PromptSearchResults = SearchResults<Prompt[]>;

export interface PromptUpdatePayload {
  documentType?: string;
  extractTable?: boolean;
  fieldsPrompt?: PromptItem[];
  name?: string;
  nameJpn?: null | string;
  shortName?: null | string;
  shortNameJpn?: null | string;
  systemPrompt?: null | string;
  tablePrompt?: null | PromptItem[];
  textualTablePrompt?: null | string;
  userCustomInstructions?: null | string;
}

export interface TableRowDetectionPayload {
  rows: BoundingBoxWithId[];
  table: BoundingBox;
  tableId: string;
}

type Options = {
  body?: FormData | string;
  headers: {
    Accept: string;
    Authorization: string;
    'Content-Type'?: string;
  };
  method: Method;
  signal?: AbortSignal;
};

type Sorting = {
  sortBy: string;
  sortOrder: string;
};

class TemplatelessApiV2Client {
  baseUrl: null | string | undefined;

  controllers: Map<string, AbortController>;

  token: null | string | undefined;

  get baseHeaders() {
    return {
      Accept: 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  constructor({ baseUrl, token }: ApiConfig) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.controllers = new Map();
  }

  abortRequest(requestId: string, documentId?: string) {
    const controller = this.controllers.get(requestId);
    if (controller) {
      controller.abort();
      this.controllers.delete(requestId);
      if (documentId) {
        const deleteDocument = async () => {
          await this.deleteDocument(documentId);
        };
        deleteDocument()
          .then(() => {})
          .catch(() => console.error('Error during deleting temp Document'));
      }
    } else {
      console.warn(`No request found with ID: ${requestId}`);
    }
  }

  /**
   * Adds converted pages to an existing document.
   * The document must be created by calling `createDocument`
   */
  async addConvertedPages(documentId: number | string, files: File[]) {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    const options = this.optionsForFormData('PATCH', formData);

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/addConvertedPages`,
      options,
    );
    throwIfError(response, 'document');
    const json = await response.json();
    return json;
  }

  async cancelTableRowDetection(
    documentId: string,
    documentPageId: string,
    requestId: string,
  ) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/pages/${documentPageId}/cancelTableRowDetectionRequest/${requestId}`,
      this.options('PATCH'),
    );

    const json = await response.json();
    throwIfError(response, 'document', documentId, json.message);

    return json;
  }

  /**
   * Create a document, returns the document id
   * This method will upload a PDF file, but will not convert pages to JPEG and
   * will not scan the document
   * @param file
   */
  async createDocument(
    file: File,
    definitionOrPromptId?: number | string,
    scanMode: ScanMode = 'llm',
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('origin', 'asralpha');

    if (scanMode === 'llm') {
      formData.append('scanMode', 'llm');
    }

    if (definitionOrPromptId && scanMode === 'standard') {
      formData.append('definitionId', `${definitionOrPromptId}`);
    } else if (definitionOrPromptId) {
      formData.append('promptId', `${definitionOrPromptId}`);
    }

    const options = this.optionsForFormData('POST', formData);

    return this.request('documents/create', options);
  }

  async createPrompt(payload: PromptCreatePayload) {
    const response = await fetch(
      `${this.baseUrl}/prompts/`,
      this.options('POST', payload),
    );

    throwIfError(response, 'prompt');
    const json = await response.json();

    return json;
  }

  /**
   * Deletes a document
   * @param id Document id
   */
  async deleteDocument(id: number | string) {
    const response = await fetch(
      `${this.baseUrl}/documents/${id}`,
      this.options('DELETE'),
    );
    throwIfError(response, 'document', id);
    const json = await response.json();

    return json;
  }

  async deletePrompt(id: number | string) {
    const response = await fetch(`${this.baseUrl}/prompts/${id}`, this.options('DELETE'));
    throwIfError(response, 'prompt', id);
    const json = await response.json();

    return json;
  }

  async exportDocument(
    documentId: string,
    format: MimeType,
    includeMetadata?: boolean,
  ): Promise<Blob> {
    const options = this.options('GET');
    options.headers.Accept = format;

    let url = `${this.baseUrl}/documents/${documentId}`;

    if (format?.includes('application/zip')) {
      url += '/groups/export';
    } else {
      url += '/export';
    }

    if (includeMetadata) {
      url += '?includeMetadata=true';
    } else {
      url += '?includeMetadata=false';
    }

    const response = await fetch(url, options);

    throwIfError(response, 'document', documentId);

    switch (format) {
      case MIME_TYPES.CSV: {
        const text = await response.text();
        const blob = new Blob([text], { type: 'application/json' });
        return blob;
      }
      case MIME_TYPES.CSV_GROUP: {
        const blob = await response.blob();
        return new Blob([blob], { type: 'application/zip' });
      }
      case MIME_TYPES.EXCEL: {
        const blob = await response.blob();
        return blob;
      }
      case MIME_TYPES.EXCEL_GROUP: {
        const blob = await response.blob();
        return new Blob([blob], { type: 'application/zip' });
      }
      case MIME_TYPES.JSON: {
        const json = await response.json();
        const jsonString = JSON.stringify(json, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        return blob;
      }
      default:
        throw new Error('Unsupported export format.');
    }
  }

  async getAllDefinitions() {
    const definitions = await iterateSearchPages<Definition[]>(async (page, pageSize) => {
      const url = new URL(
        `${typeof window === 'undefined' ? '' : window.location.origin}${this.baseUrl}/definitions/search`,
      );
      const params: SearchParams = { page, pageSize };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      const response = await fetch(url.toString(), this.options('GET'));
      throwIfError(response, 'definition');
      const json = await response.json();
      return json;
    });

    return {
      results: definitions,
    };
  }

  async getAllPresetPrompts() {
    const presetPrompts = await iterateSearchPages<Prompt[]>(async (page, pageSize) => {
      const url = new URL(
        `${typeof window === 'undefined' ? '' : window.location.origin}${this.baseUrl}/prompts/search`,
      );
      const params: SearchParams = { page, pageSize, useShared: true };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      const response = await fetch(url.toString(), this.options('GET'));
      throwIfError(response, 'prompt');
      const json = await response.json();
      return json;
    });
    return {
      results: presetPrompts,
    };
  }

  async getAllPrompts() {
    const prompts = await iterateSearchPages<Prompt[]>(async (page, pageSize) => {
      const url = new URL(
        `${typeof window === 'undefined' ? '' : window.location.origin}${this.baseUrl}/prompts/search`,
      );
      const params: SearchParams = { page, pageSize };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      const response = await fetch(url.toString(), this.options('GET'));
      throwIfError(response, 'prompt');
      const json = await response.json();
      return json;
    });

    return {
      results: prompts,
    };
  }

  async getCopyPreset(id: number | string): Promise<Prompt> {
    const url = new URL(
      `${typeof window === 'undefined' ? '' : window.location.origin}${this.baseUrl}/prompts/${id}/copyPreset`,
    );
    const response = await fetch(url.toString(), this.options('GET'));
    throwIfError(response, 'prompt');
    const json = await response.json();

    return json;
  }

  /**
   * Gets a document
   * @param id Document id
   */
  async getDocument(id: number | string): Promise<RawDocument> {
    const response = await fetch(`${this.baseUrl}/documents/${id}`, this.options('GET'));
    throwIfError(response, 'document', id);
    const json = await response.json();

    return json;
  }

  async getPrompt(id: number | string): Promise<Prompt> {
    const response = await fetch(`${this.baseUrl}/prompts/${id}`, this.options('GET'));
    throwIfError(response, 'prompt', id);
    const json = await response.json();

    return json;
  }

  async getTableRowDetectionStatus(documentId: string, documentPageId: string) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/pages/${documentPageId}/tableRowDetectionRequestStatus`,
      this.options('GET'),
    );

    const json = await response.json();
    throwIfError(response, 'document', documentId, json.message);

    return json;
  }

  /**
   * Create groups for a document.
   * Note that pages in the groups array refers to the page id, not the page number
   */
  async groupDocument(documentId: number | string, groups: DocumentGroupItem[]) {
    const payload = {
      groups,
    };

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/groups`,
      this.options('PATCH', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  /**
   * Healthcheck
   */
  async healthcheck(): Promise<HealthcheckResponse> {
    const response = await fetch(`${this.baseUrl}/healthcheck`, this.options('GET'));
    throwIfError(response);
    const json = await response.json();

    return json;
  }

  options(method: Method, payload?: any) {
    const ret: Options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      method,
    };

    ret.headers['Content-Type'] = 'application/json';

    if (payload) {
      ret.body = JSON.stringify(payload);
    }

    return ret;
  }

  optionsForFormData(method: Method, payload: FormData) {
    const ret: Options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      method,
    };

    ret.body = payload;

    return ret;
  }

  /**
   * Process or reprocess a document
   * This method can be used to automatically convert pages for a document that was
   * created by calling `createDocument`, or to re-do conversion for a document that
   * already has pages (for example after a conversion error).
   */
  async reprocessDocument(
    documentId: number | string,
    pdfConversionMethod: PdfConversionMethod,
    scanAfterProcessing: boolean = true,
  ) {
    const options = this.options('PATCH', { pdfConversionMethod, scanAfterProcessing });

    return this.request(`documents/${documentId}/reprocess`, options);
  }

  async request(endpoint: string, options = {}, returnType: 'blob' | 'json' = 'json') {
    const controller = new AbortController();
    const { signal } = controller;

    this.controllers.set(endpoint, controller);

    const response = await fetch(`${this.baseUrl}/${endpoint}`, { ...options, signal });

    this.controllers.delete(endpoint);

    throwIfError(response, 'document');
    const data = returnType === 'json' ? await response.json() : await response.blob();
    return data;
  }

  async requestTableRowDetection(
    documentId: string,
    documentPageId: string,
    payload: TableRowDetectionPayload,
  ) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/pages/${documentPageId}/detectTableRows`,
      this.options('PATCH', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async rescanDocument(documentId: number | string, useOcr: boolean) {
    // TODO: This endpoint needs to support changing the promptId or definition id
    // as well as the scan type
    const payload = { useOcr };

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/rescan`,
      this.options('POST', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async rescanDocumentPage(
    documentId: number | string,
    documentPageId: number | string,
    useOcr?: boolean,
  ) {
    // TODO: This endpoint needs to support changing the promptId or definition id
    // as well as the scan type
    const payload = { useOcr };

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/pages/${documentPageId}/rescan`,
      this.options('POST', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async rescanDocumentPageGroup(
    documentId: number | string,
    documentPageGroupId: number | string,
    promptId?: number | string,
    useOcr?: boolean,
  ) {
    const payload = (() => {
      if (promptId || useOcr) {
        return {
          promptId,
          useOcr,
        };
      }
      return {};
    })();

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/groups/${documentPageGroupId}/rescan`,
      this.options('POST', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async saveGroupCorrections(documentId: string, documentGroupId: string, payload = {}) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/groups/${documentGroupId}/correction`,
      this.options('PATCH', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async savePageCorrections(documentId: string, documentPageId: string, payload = {}) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/pages/${documentPageId}/correction`,
      this.options('PATCH', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async scanDocument(documentId: number | string) {
    const payload = {};

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/scan`,
      this.options('POST', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async searchDocuments(
    filters = {},
    { sortBy, sortOrder }: Sorting = { sortBy: 'updatedAt', sortOrder: 'd' },
    page = 1,
    pageSize = 10,
  ): Promise<DocumentSearchResults> {
    const url = new URL(
      `${typeof window === 'undefined' ? '' : window.location.origin}${this.baseUrl}/documents/search`,
    );
    const params: SearchParams = {
      ...filters,
      page,
      pageSize,
      sortBy,
      sortOrder,
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), this.options('GET'));
    throwIfError(response, 'document');
    const json = await response.json();

    return json;
  }

  async searchPrompts(
    filters = {},
    { sortBy, sortOrder }: Sorting = { sortBy: 'updatedAt', sortOrder: 'd' },
    page = 1,
    pageSize = 10,
  ): Promise<PromptSearchResults> {
    const url = new URL(
      `${typeof window === 'undefined' ? '' : window.location.origin}${this.baseUrl}/prompts/search`,
    );

    const params: SearchParams = {
      ...filters,
      page,
      pageSize,
      sortBy,
      sortOrder,
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), this.options('GET'));
    throwIfError(response, 'prompt');
    const json = await response.json();

    return json;
  }

  async sendFeedback(documentId: string, feedback: string) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/feedback`,
      this.options('POST', { feedback }),
    );

    throwIfError(response, 'document');
    const json = await response.json();

    return json;
  }

  async updateDocument(documentId: string, payload = {}) {
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}`,
      this.options('PATCH', payload),
    );

    throwIfError(response, 'document', documentId);
    const json = await response.json();

    return json;
  }

  async updatePrompt(id: number | string, payload: PromptUpdatePayload = {}) {
    const response = await fetch(
      `${this.baseUrl}/prompts/${id}`,
      this.options('PATCH', payload),
    );

    throwIfError(response, 'prompt', id);
    const json = await response.json();

    return json;
  }

  /**
   * Uploads a document, returns the document id
   * This method will upload a PDF file, convert each page to JPEG and then scan
   * everything.
   */
  async uploadDocument(
    file: File,
    definitionOrPromptId: number | string,
    scanMode: ScanMode = 'llm',
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('origin', 'asralpha');
    formData.append('pdfConversionMethod', 'standard');

    if (scanMode === 'standard') {
      formData.append('definitionId', `${definitionOrPromptId}`);
    } else {
      formData.append('scanMode', 'llm');
      formData.append('promptId', `${definitionOrPromptId}`);
    }

    const options = this.optionsForFormData('POST', formData);

    const response = await fetch(`${this.baseUrl}/documents`, options);
    throwIfError(response, 'document');
    const json = await response.json();
    return json;
  }
}

export default TemplatelessApiV2Client;
export type { RawDocument };
