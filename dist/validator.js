"use strict";
/**
 * Input validation
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
exports.validateTagFormat = validateTagFormat;
exports.validateTemplate = validateTemplate;
exports.validateFilePath = validateFilePath;
exports.validateGitHubToken = validateGitHubToken;
exports.validateBoolean = validateBoolean;
exports.validateExcludeLabels = validateExcludeLabels;
exports.validateInputs = validateInputs;
const fs = __importStar(require("fs/promises"));
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
const templates_1 = require("./templates");
const logger = __importStar(require("./logger"));
/**
 * Create empty validation result
 */
function createValidationResult() {
    return {
        valid: true,
        errors: [],
        warnings: [],
    };
}
/**
 * Validate tag format
 */
function validateTagFormat(tag) {
    const result = createValidationResult();
    if (!(0, utils_1.isValidSemver)(tag)) {
        result.valid = false;
        result.errors.push(`Invalid tag format: '${tag}'. Expected Semantic Versioning (e.g., v1.2.3, v2.0.0-beta.1)`);
    }
    else {
        logger.validation(true, `Valid Semantic Versioning tag: ${tag}`);
    }
    return result;
}
/**
 * Validate template name
 */
function validateTemplate(template) {
    const result = createValidationResult();
    const available = (0, templates_1.getAvailableTemplates)();
    if (!available.includes(template.toLowerCase())) {
        result.valid = false;
        result.errors.push(`Invalid template: '${template}'. Available templates: ${available.join(', ')}`);
    }
    else {
        logger.validation(true, `Template '${template}' is valid`);
    }
    return result;
}
/**
 * Validate file path
 */
async function validateFilePath(filePath) {
    const result = createValidationResult();
    try {
        // Check if parent directory exists
        const dir = filePath.substring(0, filePath.lastIndexOf('/'));
        if (dir) {
            try {
                await fs.access(dir);
                logger.validation(true, `Directory '${dir}' exists`);
            }
            catch {
                result.warnings.push(`Directory '${dir}' does not exist, will be created`);
            }
        }
    }
    catch (error) {
        result.warnings.push(`Could not validate file path: ${filePath}`);
    }
    return result;
}
/**
 * Validate GitHub token permissions (basic check)
 */
function validateGitHubToken(token) {
    const result = createValidationResult();
    if (!token || token.trim() === '') {
        result.valid = false;
        result.errors.push('GitHub token is required');
        return result;
    }
    if (token.length < 20) {
        result.valid = false;
        result.errors.push('GitHub token appears to be invalid (too short)');
        return result;
    }
    logger.validation(true, 'GitHub token is provided');
    return result;
}
/**
 * Validate boolean input
 */
function validateBoolean(value, name) {
    const result = createValidationResult();
    if (value !== 'true' && value !== 'false' && value !== '') {
        result.valid = false;
        result.errors.push(`Invalid boolean value for '${name}': '${value}'. Expected 'true' or 'false'`);
    }
    return result;
}
/**
 * Validate exclude labels format
 */
function validateExcludeLabels(labels) {
    const result = createValidationResult();
    if (labels && labels.trim() !== '') {
        const labelList = labels.split(',').map((s) => s.trim());
        if (labelList.length > 0) {
            logger.validation(true, `Exclude labels: ${labelList.join(', ')}`);
        }
    }
    return result;
}
/**
 * Run all validations
 */
async function validateInputs(inputs) {
    logger.section('Input Validation');
    const results = [];
    // Validate tag format
    results.push(validateTagFormat(inputs.version));
    // Validate template
    results.push(validateTemplate(inputs.template));
    // Validate file path
    results.push(await validateFilePath(inputs.changelogFile));
    // Validate token
    results.push(validateGitHubToken(inputs.token));
    // Validate boolean inputs
    results.push(validateBoolean(inputs.versionFile, 'version-file'));
    results.push(validateBoolean(inputs.createGithubRelease, 'create-github-release'));
    results.push(validateBoolean(inputs.dryRun, 'dry-run'));
    // Validate exclude labels
    results.push(validateExcludeLabels(inputs.excludeLabels));
    // Merge all results
    const finalResult = {
        valid: results.every((r) => r.valid),
        errors: results.flatMap((r) => r.errors),
        warnings: results.flatMap((r) => r.warnings),
    };
    // Log errors and warnings
    for (const error of finalResult.errors) {
        core.error(error);
    }
    for (const warning of finalResult.warnings) {
        core.warning(warning);
    }
    if (finalResult.valid) {
        logger.success('All input validations passed');
    }
    else {
        logger.error('Input validation failed');
    }
    return finalResult;
}
//# sourceMappingURL=validator.js.map