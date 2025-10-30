"use strict";
/**
 * Template factory
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = getTemplate;
exports.getAvailableTemplates = getAvailableTemplates;
const standard_1 = require("./standard");
const detailed_1 = require("./detailed");
const minimal_1 = require("./minimal");
__exportStar(require("./standard"), exports);
__exportStar(require("./detailed"), exports);
__exportStar(require("./minimal"), exports);
/**
 * Get template by name
 */
function getTemplate(name) {
    switch (name.toLowerCase()) {
        case 'standard':
            return new standard_1.StandardTemplate();
        case 'detailed':
            return new detailed_1.DetailedTemplate();
        case 'minimal':
            return new minimal_1.MinimalTemplate();
        default:
            throw new Error(`Unknown template: ${name}. Available templates: standard, detailed, minimal`);
    }
}
/**
 * Get list of available template names
 */
function getAvailableTemplates() {
    return ['standard', 'detailed', 'minimal'];
}
//# sourceMappingURL=index.js.map