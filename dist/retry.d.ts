/**
 * Retry logic with exponential backoff
 */
/**
 * Retry options
 */
export interface RetryOptions {
    /** Maximum number of retry attempts */
    maxRetries?: number;
    /** Initial delay in milliseconds */
    initialDelay?: number;
    /** Maximum delay in milliseconds */
    maxDelay?: number;
    /** Backoff multiplier */
    backoffMultiplier?: number;
    /** Condition to determine if error is retryable */
    isRetryable?: (error: Error) => boolean;
}
/**
 * Execute a function with retry logic
 */
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Check if error is a GitHub API rate limit error
 */
export declare function isRateLimitError(error: Error): boolean;
/**
 * Check if error is a network/timeout error
 */
export declare function isNetworkError(error: Error): boolean;
/**
 * Check if error is retryable (not auth/permission errors)
 */
export declare function isRetryableError(error: Error): boolean;
/**
 * Retry with custom options for GitHub API calls
 */
export declare function withGitHubRetry<T>(fn: () => Promise<T>): Promise<T>;
