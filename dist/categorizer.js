"use strict";
/**
 * Change categorizer
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
exports.createEmptyCategories = createEmptyCategories;
exports.categorizeCommits = categorizeCommits;
exports.categorizePullRequests = categorizePullRequests;
exports.mergeCategories = mergeCategories;
exports.getCategoryStats = getCategoryStats;
exports.logCategoryStats = logCategoryStats;
const core = __importStar(require("@actions/core"));
/**
 * Type to category mapping
 */
const TYPE_TO_CATEGORY = {
    feat: 'features',
    fix: 'bugFixes',
    docs: 'documentation',
    style: 'style',
    refactor: 'refactoring',
    perf: 'performance',
    test: 'tests',
    build: 'build',
    ci: 'ci',
    chore: 'other',
};
/**
 * Label to category mapping
 */
const LABEL_TO_CATEGORY = {
    feature: 'features',
    enhancement: 'features',
    bug: 'bugFixes',
    bugfix: 'bugFixes',
    documentation: 'documentation',
    performance: 'performance',
    'breaking-change': 'breaking',
};
/**
 * Create empty categorized changes
 */
function createEmptyCategories() {
    return {
        breaking: [],
        features: [],
        bugFixes: [],
        documentation: [],
        performance: [],
        refactoring: [],
        style: [],
        tests: [],
        build: [],
        ci: [],
        other: [],
    };
}
/**
 * Categorize commits into change categories
 */
function categorizeCommits(commits) {
    const categories = createEmptyCategories();
    for (const commit of commits) {
        const item = {
            type: commit.type,
            description: commit.subject,
            commitHash: commit.hash,
            author: commit.author,
            issues: [],
            breaking: commit.breaking,
        };
        // Breaking changes take priority
        if (commit.breaking) {
            categories.breaking.push(item);
            continue;
        }
        // Categorize by type
        const category = TYPE_TO_CATEGORY[commit.type] || 'other';
        categories[category].push(item);
    }
    return categories;
}
/**
 * Categorize pull requests into change categories
 */
function categorizePullRequests(prs) {
    const categories = createEmptyCategories();
    for (const pr of prs) {
        const item = {
            type: '',
            description: pr.title,
            prNumber: pr.number,
            author: pr.author,
            issues: pr.closedIssues,
            breaking: pr.labels.includes('breaking-change'),
        };
        // Breaking changes take priority
        if (item.breaking) {
            categories.breaking.push(item);
            continue;
        }
        // Try to categorize by label first
        let categorized = false;
        for (const label of pr.labels) {
            const category = LABEL_TO_CATEGORY[label.toLowerCase()];
            if (category) {
                categories[category].push(item);
                categorized = true;
                break;
            }
        }
        // If not categorized by label, put in other
        if (!categorized) {
            categories.other.push(item);
        }
    }
    return categories;
}
/**
 * Merge two categorized changes
 */
function mergeCategories(a, b) {
    return {
        breaking: [...a.breaking, ...b.breaking],
        features: [...a.features, ...b.features],
        bugFixes: [...a.bugFixes, ...b.bugFixes],
        documentation: [...a.documentation, ...b.documentation],
        performance: [...a.performance, ...b.performance],
        refactoring: [...a.refactoring, ...b.refactoring],
        style: [...a.style, ...b.style],
        tests: [...a.tests, ...b.tests],
        build: [...a.build, ...b.build],
        ci: [...a.ci, ...b.ci],
        other: [...a.other, ...b.other],
    };
}
/**
 * Get statistics of categorized changes
 */
function getCategoryStats(categories) {
    return {
        'Breaking Changes': categories.breaking.length,
        Features: categories.features.length,
        'Bug Fixes': categories.bugFixes.length,
        Documentation: categories.documentation.length,
        Performance: categories.performance.length,
        Refactoring: categories.refactoring.length,
        Style: categories.style.length,
        Tests: categories.tests.length,
        Build: categories.build.length,
        'CI/CD': categories.ci.length,
        Other: categories.other.length,
    };
}
/**
 * Log category statistics
 */
function logCategoryStats(categories) {
    const stats = getCategoryStats(categories);
    core.info('Categorizing changes...');
    for (const [category, count] of Object.entries(stats)) {
        if (count > 0) {
            core.info(`  ${category}: ${count} items`);
        }
    }
}
//# sourceMappingURL=categorizer.js.map