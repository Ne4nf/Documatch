const SUPPORTED_LOCALES = ['ja', 'en'];

const DRAWER_WIDTH = 240;
const FOOTER_HEIGHT = 50;
const HEADER_HEIGHT = 63;
const DOCUMENT_HEADER_HEIGHT = 74;

const Z_INDEX = {
  OVERLAY_SPINNER_Z: 1200,
} as const;

const SIZES = {
  DOCUMENT_HEADER_HEIGHT,
  DRAWER_WIDTH,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
} as const;

const MIME_TYPES = {
  CSV: 'text/csv',
  CSV_GROUP: 'text/csv,application/zip',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  EXCEL_GROUP:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip',
  JSON: 'application/json',
} as const;

const FILE_EXTENSIONS = {
  [MIME_TYPES.CSV]: 'csv',
  [MIME_TYPES.CSV_GROUP]: 'zip',
  [MIME_TYPES.EXCEL]: 'xlsx',
  [MIME_TYPES.EXCEL_GROUP]: 'zip',
  [MIME_TYPES.JSON]: 'json',
} as const;

const PATHS = {
  DOCUMENT: '/document',
  DOCUMENT_ID: '/document/{0}',
  DOCUMENT_TYPE: '/document-type',
  DOCUMENT_TYPE_ID: '/document-type/{0}',
  ROOT: '/',
};

const DATE_FORMATS = {
  DATE: 'yyyy/MM/dd',
  DATETIME: 'yyyy/MM/dd HH:mm',
  SEARCH_FILTER: 'yyyy-MM-dd HH:mm',
};

const DOCUMENT_STATUS = Object.freeze({
  PREPROCESSED: 'preprocessed',
  PREPROCESSED_DETECTION: 'preprocessedDetection',
  PREPROCESSING_DETECTION_PENDING: 'preprocessingDetectionPending',
  PREPROCESSING_PENDING: 'preprocessingPending',
  PROCESSED: 'processed',
  PROCESSING_ERROR: 'processingError',
  PROCESSING_PENDING: 'processingPending',
  SCAN_ERROR: 'scanError',
  SCAN_PENDING: 'scanPending',
  SCANNED: 'scanned',
  UNPROCESSED: 'unprocessed',
});

const TABLE_ROW_DETECTION_STATUS = Object.freeze({
  CANCELLED: 'cancelled',
  DONE: 'done',
  ERROR: 'error',
  PENDING: 'pending',
});

const PENDING_STATUSES = [
  'unprocessed',
  'preprocessingPending',
  'preprocessingDetectionPending',
  'processingPending',
  'preprocessed',
  'preprocessedDetection',
  'processed',
  'scanPending',
];

const DONE_STATUSES = ['scanned'];

const ERROR_STATUSES = ['processingError', 'scanError'];

const PAGINATION_OPTIONS = [10, 25, 50, 150, 200, 250];

export type MimeType = (typeof MIME_TYPES)[keyof typeof MIME_TYPES];

const TEST_IDS = {
  DROPZONE: {
    DELETE_ITEM: 'DELETE_ITEM',
    DROP_BOX: 'DROP_BOX',
    DROP_INPUT: 'DROP_INPUT',
  },
};

export {
  DATE_FORMATS,
  DOCUMENT_STATUS,
  DONE_STATUSES,
  ERROR_STATUSES,
  FILE_EXTENSIONS,
  MIME_TYPES,
  PAGINATION_OPTIONS,
  PATHS,
  PENDING_STATUSES,
  SIZES,
  SUPPORTED_LOCALES,
  TABLE_ROW_DETECTION_STATUS,
  TEST_IDS,
  Z_INDEX,
};
