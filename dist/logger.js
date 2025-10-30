"use strict";
/**
 * Enhanced logging utilities
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
exports.Timer = exports.LogLevel = void 0;
exports.setLogLevel = setLogLevel;
exports.isDebugEnabled = isDebugEnabled;
exports.debug = debug;
exports.info = info;
exports.warning = warning;
exports.error = error;
exports.success = success;
exports.startGroup = startGroup;
exports.endGroup = endGroup;
exports.progress = progress;
exports.section = section;
exports.debugObject = debugObject;
exports.validation = validation;
const core = __importStar(require("@actions/core"));
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARNING"] = 2] = "WARNING";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Current log level (can be controlled via environment)
 */
let currentLogLevel = LogLevel.INFO;
/**
 * Set log level
 */
function setLogLevel(level) {
    currentLogLevel = level;
}
/**
 * Check if debug mode is enabled
 */
function isDebugEnabled() {
    return process.env.ACTIONS_STEP_DEBUG === 'true' || currentLogLevel <= LogLevel.DEBUG;
}
/**
 * Debug log (only shown when debug mode is enabled)
 */
function debug(message, ...args) {
    if (isDebugEnabled()) {
        const formatted = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;
        core.debug(formatted);
    }
}
/**
 * Info log
 */
function info(message) {
    if (currentLogLevel <= LogLevel.INFO) {
        core.info(message);
    }
}
/**
 * Warning log
 */
function warning(message) {
    if (currentLogLevel <= LogLevel.WARNING) {
        core.warning(message);
    }
}
/**
 * Error log
 */
function error(message) {
    core.error(message);
}
/**
 * Success log with checkmark
 */
function success(message) {
    info(`✓ ${message}`);
}
/**
 * Start a log group
 */
function startGroup(name) {
    core.startGroup(name);
}
/**
 * End a log group
 */
function endGroup() {
    core.endGroup();
}
/**
 * Log with progress indicator
 */
function progress(current, total, message) {
    info(`[${current}/${total}] ${message}`);
}
/**
 * Log a section header
 */
function section(title) {
    info('');
    info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    info(`  ${title}`);
    info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    info('');
}
/**
 * Log operation timing
 */
class Timer {
    startTime;
    label;
    constructor(label) {
        this.label = label;
        this.startTime = Date.now();
        debug(`Timer started: ${label}`);
    }
    end() {
        const duration = Date.now() - this.startTime;
        debug(`Timer ended: ${this.label} (${duration}ms)`);
    }
    endWithLog() {
        const duration = Date.now() - this.startTime;
        info(`${this.label} completed in ${duration}ms`);
    }
}
exports.Timer = Timer;
/**
 * Log an object in debug mode
 */
function debugObject(label, obj) {
    if (isDebugEnabled()) {
        debug(`${label}:`, obj);
    }
}
/**
 * Log validation result
 */
function validation(passed, message) {
    if (passed) {
        info(`✓ ${message}`);
    }
    else {
        error(`✗ ${message}`);
    }
}
//# sourceMappingURL=logger.js.map