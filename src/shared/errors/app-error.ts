import { ErrorCode } from './error-codes'

export interface FieldError {
    field: string
    message: string
}

export class AppError extends Error {
    public readonly fields?: FieldError[]
    public readonly code: ErrorCode
    public readonly statusCode: number
    public readonly isOperational: boolean

    constructor(
        message: string,
        code: ErrorCode,
        statusCode: number,
        fields?: FieldError[],
        isOperational = true,
    ) {
        super(message)
        this.code = code
        this.statusCode = statusCode
        this.isOperational = isOperational
        this.fields = fields
    }

    static validationError(message: string, fields?: FieldError[]): AppError {
        return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, fields)
    }

    static authenticationError(message = 'Authentication required'): AppError {
        return new AppError(message, ErrorCode.AUTH_REQUIRED, 401)
    }

    static authorizationError(message = 'Access forbidden'): AppError {
        return new AppError(message, ErrorCode.FORBIDDEN, 403)
    }

    static notFoundError(message = 'Resource not found'): AppError {
        return new AppError(message, ErrorCode.NOT_FOUND, 404)
    }

    static conflictError(message: string): AppError {
        return new AppError(message, ErrorCode.CONFLICT, 409)
    }

    static internalError(message = 'Internal server error'): AppError {
        return new AppError(message, ErrorCode.INTERNAL_ERROR, 500, undefined, false)
    }

    static aiLockedError(message = 'AI features are locked'): AppError {
        return new AppError(message, ErrorCode.AI_LOCKED, 403)
    }

    static paymentRequiredError(message = 'Insufficient credits'): AppError {
        return new AppError(message, ErrorCode.PAYMENT_REQUIRED, 402)
    }

    static rateLimitedError(message = 'Rate limit exceeded'): AppError {
        return new AppError(message, ErrorCode.RATE_LIMITED, 429)
    }
}
