export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "ERROR",
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Set prototype explicitly to work with instanceof
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
