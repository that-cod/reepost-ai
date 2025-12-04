/**
 * Custom Error Classes and Error Handling
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(502, message || `${service} service unavailable`);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error response formatter
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  };
}

export function formatErrorResponse(error: Error | AppError): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.name,
        statusCode: error.statusCode,
      },
    };
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    };
  }

  return {
    error: {
      message: error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  };
}

/**
 * Async error handler wrapper for API routes
 */
export function asyncHandler(
  fn: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await fn(req, context);
    } catch (error) {
      const errorResponse = formatErrorResponse(error as Error);
      return Response.json(errorResponse, {
        status: errorResponse.error.statusCode,
      });
    }
  };
}
