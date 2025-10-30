/**
 * Enhanced logging utilities
 */
/**
 * Log levels
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3
}
/**
 * Set log level
 */
export declare function setLogLevel(level: LogLevel): void;
/**
 * Check if debug mode is enabled
 */
export declare function isDebugEnabled(): boolean;
/**
 * Debug log (only shown when debug mode is enabled)
 */
export declare function debug(message: string, ...args: unknown[]): void;
/**
 * Info log
 */
export declare function info(message: string): void;
/**
 * Warning log
 */
export declare function warning(message: string): void;
/**
 * Error log
 */
export declare function error(message: string): void;
/**
 * Success log with checkmark
 */
export declare function success(message: string): void;
/**
 * Start a log group
 */
export declare function startGroup(name: string): void;
/**
 * End a log group
 */
export declare function endGroup(): void;
/**
 * Log with progress indicator
 */
export declare function progress(current: number, total: number, message: string): void;
/**
 * Log a section header
 */
export declare function section(title: string): void;
/**
 * Log operation timing
 */
export declare class Timer {
    private startTime;
    private label;
    constructor(label: string);
    end(): void;
    endWithLog(): void;
}
/**
 * Log an object in debug mode
 */
export declare function debugObject(label: string, obj: unknown): void;
/**
 * Log validation result
 */
export declare function validation(passed: boolean, message: string): void;
