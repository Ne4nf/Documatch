class OrganizationNotFoundError extends Error {
  organizationId: number | string | undefined;

  constructor(message: string, organizationId?: number | string) {
    super(message);
    this.organizationId = organizationId;
  }
}

export default OrganizationNotFoundError;
