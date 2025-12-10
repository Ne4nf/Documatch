class ConflictError extends Error {
  isRequestForCancelledDetection: boolean;

  constructor(message: string, _options: any, msgText?: string) {
    super(message);
    this.isRequestForCancelledDetection = msgText === 'detectionAlreadyCompleted';
  }
}

export default ConflictError;
