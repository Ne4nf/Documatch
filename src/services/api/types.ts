export type ApiConfig = {
  baseUrl?: null | string;
  token?: null | string;
};

export type ErrorEntity =
  | 'definition'
  | 'document'
  | 'organization'
  | 'prompt'
  | 'unknown'
  | 'user';

export type Method = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export type PdfConversionMethod = 'enhanced' | 'standard';

export type ScanMode = 'llm' | 'standard';

export type SearchParams = { [key: string]: any };
