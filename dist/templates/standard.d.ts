/**
 * Standard template
 */
import type { ReleaseData, ChangeItem } from '../types';
import { Template } from './base';
export declare class StandardTemplate implements Template {
    formatChangeItem(item: ChangeItem, owner: string, repo: string): string;
    formatCategory(categoryKey: string, items: ChangeItem[], owner: string, repo: string): string;
    generate(data: ReleaseData): string;
}
//# sourceMappingURL=standard.d.ts.map