class UserNotFoundError extends Error {
  userId: number | string | undefined;

  constructor(message: string, userId?: number | string) {
    super(message);
    this.userId = userId;
  }
}

export default UserNotFoundError;
