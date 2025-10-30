/**
 * Enhanced logging utilities
 */

import * as core from '@actions/core';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

/**
 * Current log level (can be controlled via environment)
 */
let currentLogLevel = LogLevel.INFO;

/**
 * Set log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  return process.env.ACTIONS_STEP_DEBUG === 'true' || currentLogLevel <= LogLevel.DEBUG;
}

/**
 * Debug log (only shown when debug mode is enabled)
 */
export function debug(message: string, ...args: unknown[]): void {
  if (isDebugEnabled()) {
    const formatted = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;
    core.debug(formatted);
  }
}

/**
 * Info log
 */
export function info(message: string): void {
  if (currentLogLevel <= LogLevel.INFO) {
    core.info(message);
  }
}

/**
 * Warning log
 */
export function warning(message: string): void {
  if (currentLogLevel <= LogLevel.WARNING) {
    core.warning(message);
  }
}

/**
 * Error log
 */
export function error(message: string): void {
  core.error(message);
}

/**
 * Success log with checkmark
 */
export function success(message: string): void {
  info(`✓ ${message}`);
}

/**
 * Start a log group
 */
export function startGroup(name: string): void {
  core.startGroup(name);
}

/**
 * End a log group
 */
export function endGroup(): void {
  core.endGroup();
}

/**
 * Log with progress indicator
 */
export function progress(current: number, total: number, message: string): void {
  info(`[${current}/${total}] ${message}`);
}

/**
 * Log a section header
 */
export function section(title: string): void {
  info('');
  info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  info(`  ${title}`);
  info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  info('');
}

/**
 * Log operation timing
 */
export class Timer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
    debug(`Timer started: ${label}`);
  }

  end(): void {
    const duration = Date.now() - this.startTime;
    debug(`Timer ended: ${this.label} (${duration}ms)`);
  }

  endWithLog(): void {
    const duration = Date.now() - this.startTime;
    info(`${this.label} completed in ${duration}ms`);
  }
}

/**
 * Log an object in debug mode
 */
export function debugObject(label: string, obj: unknown): void {
  if (isDebugEnabled()) {
    debug(`${label}:`, obj);
  }
}

/**
 * Log validation result
 */
export function validation(passed: boolean, message: string): void {
  if (passed) {
    info(`✓ ${message}`);
  } else {
    error(`✗ ${message}`);
  }
}
