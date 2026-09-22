class ApiError extends Error {
  constructor(
    message = 'Something went wrong',
    statusCode,
    code = null,
    errors = [],
    stack,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
