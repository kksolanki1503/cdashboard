import AppError from "./AppError.js";

class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    Object.assign(this, { details });
  }
}

export default ValidationError;
