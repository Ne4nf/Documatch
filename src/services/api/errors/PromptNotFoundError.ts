class PromptNotFoundError extends Error {
  promptId: number | string | undefined;

  constructor(message: string, promptId?: number | string) {
    super(message);
    this.promptId = promptId;
  }
}

export default PromptNotFoundError;
