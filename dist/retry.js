"use strict";
/**
 * Retry logic with exponential backoff
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
exports.isRateLimitError = isRateLimitError;
exports.isNetworkError = isNetworkError;
exports.isRetryableError = isRetryableError;
exports.withGitHubRetry = withGitHubRetry;
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
/**
 * Default retry options
 */
const DEFAULT_OPTIONS = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    isRetryable: () => true,
};
/**
 * Execute a function with retry logic
 */
async function withRetry(fn, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError = new Error('Unknown error');
    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
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
            const delay = Math.min(opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt), opts.maxDelay);
            core.warning(`Attempt ${attempt + 1}/${opts.maxRetries} failed: ${lastError.message}. Retrying in ${delay}ms...`);
            await (0, utils_1.sleep)(delay);
        }
    }
    throw new Error(`Failed after ${opts.maxRetries} attempts. Last error: ${lastError.message}`);
}
/**
 * Check if error is a GitHub API rate limit error
 */
function isRateLimitError(error) {
    return error.message.includes('rate limit') || error.message.includes('403');
}
/**
 * Check if error is a network/timeout error
 */
function isNetworkError(error) {
    const message = error.message.toLowerCase();
    return (message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('network'));
}
/**
 * Check if error is retryable (not auth/permission errors)
 */
function isRetryableError(error) {
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
async function withGitHubRetry(fn) {
    return withRetry(fn, {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        isRetryable: isRetryableError,
    });
}
//# sourceMappingURL=retry.js.map