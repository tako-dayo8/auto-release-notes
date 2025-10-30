/**
 * Minimal template with simple format
 */
import type { ReleaseData, ChangeItem } from '../types';
import { Template } from './base';
export declare class MinimalTemplate implements Template {
    formatChangeItem(item: ChangeItem, _owner: string, _repo: string): string;
    formatCategory(_categoryKey: string, items: ChangeItem[], owner: string, repo: string): string;
    generate(data: ReleaseData): string;
}
//# sourceMappingURL=minimal.d.ts.map