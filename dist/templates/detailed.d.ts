/**
 * Detailed template with extra information
 */
import type { ReleaseData, ChangeItem } from '../types';
import { Template } from './base';
export declare class DetailedTemplate implements Template {
    formatChangeItem(item: ChangeItem, owner: string, repo: string): string;
    formatCategory(categoryKey: string, items: ChangeItem[], owner: string, repo: string): string;
    private getStatistics;
    private getContributorStats;
    generate(data: ReleaseData): string;
}
//# sourceMappingURL=detailed.d.ts.map