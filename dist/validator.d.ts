/**
 * Input validation
 */
/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Validate tag format
 */
export declare function validateTagFormat(tag: string): ValidationResult;
/**
 * Validate template name
 */
export declare function validateTemplate(template: string): ValidationResult;
/**
 * Validate file path
 */
export declare function validateFilePath(filePath: string): Promise<ValidationResult>;
/**
 * Validate GitHub token permissions (basic check)
 */
export declare function validateGitHubToken(token: string): ValidationResult;
/**
 * Validate boolean input
 */
export declare function validateBoolean(value: string, name: string): ValidationResult;
/**
 * Validate exclude labels format
 */
export declare function validateExcludeLabels(labels: string): ValidationResult;
/**
 * Run all validations
 */
export declare function validateInputs(inputs: {
    version: string;
    template: string;
    changelogFile: string;
    token: string;
    versionFile: string;
    createGithubRelease: string;
    dryRun: string;
    excludeLabels: string;
}): Promise<ValidationResult>;
