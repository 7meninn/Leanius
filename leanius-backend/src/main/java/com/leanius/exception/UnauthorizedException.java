package com.leanius.exception;

/**
 * Exception thrown when a user tries to perform an action they're not authorized for.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
