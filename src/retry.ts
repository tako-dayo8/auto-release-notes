/**
 * Retry logic with exponential backoff
 */

import * as core from '@actions/core';
import { sleep } from './utils';

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
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  isRetryable: () => true,
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (!opts.isRetryable(lastError)) {
        core.debug(`Error is not retryable: ${lastError.message}`);
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );

      core.warning(
        `Attempt ${attempt + 1}/${opts.maxRetries} failed: ${lastError.message}. Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw new Error(
    `Failed after ${opts.maxRetries} attempts. Last error: ${lastError.message}`
  );
}

/**
 * Check if error is a GitHub API rate limit error
 */
export function isRateLimitError(error: Error): boolean {
  return error.message.includes('rate limit') || error.message.includes('403');
}

/**
 * Check if error is a network/timeout error
 */
export function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('network')
  );
}

/**
 * Check if error is retryable (not auth/permission errors)
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Don't retry authentication or permission errors
  if (message.includes('401') || message.includes('unauthorized')) {
    return false;
  }
  if (message.includes('403') && !isRateLimitError(error)) {
    return false;
  }
  if (message.includes('404') || message.includes('not found')) {
    return false;
  }

  // Retry on rate limits and network errors
  return isRateLimitError(error) || isNetworkError(error) || message.includes('500');
}

/**
 * Retry with custom options for GitHub API calls
 */
export async function withGitHubRetry<T>(fn: () => Promise<T>): Promise<T> {
  return withRetry(fn, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    isRetryable: isRetryableError,
  });
}
