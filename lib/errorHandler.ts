export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: "ERROR",
      statusCode: 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN",
    statusCode: 500,
  };
};

export const handleConvexError = (error: unknown) => {
  console.error("Convex error:", error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("not found")) {
      return {
        message: "Resource not found",
        code: "NOT_FOUND",
        statusCode: 404,
      };
    }

    if (message.includes("unauthorized") || message.includes("unauthenticated")) {
      return {
        message: "Unauthorized access",
        code: "UNAUTHORIZED",
        statusCode: 401,
      };
    }

    if (message.includes("forbidden")) {
      return {
        message: "Access forbidden",
        code: "FORBIDDEN",
        statusCode: 403,
      };
    }
  }

  return {
    message: "Failed to perform operation",
    code: "OPERATION_FAILED",
    statusCode: 500,
  };
};

export const handleNetworkError = () => {
  return {
    message: "Network error. Please check your connection and try again.",
    code: "NETWORK_ERROR",
    statusCode: 0,
  };
};
