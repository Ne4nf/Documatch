class DefinitionNotFoundError extends Error {
  definitionId: number | string | undefined;

  constructor(message: string, definitionId?: number | string) {
    super(message);
    this.definitionId = definitionId;
  }
}

export default DefinitionNotFoundError;
