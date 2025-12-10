class DocumentNotFoundError extends Error {
  documentId: number | string | undefined;

  constructor(message: string, documentId?: number | string) {
    super(message);
    this.documentId = documentId;
  }
}

export default DocumentNotFoundError;
