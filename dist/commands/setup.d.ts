import type { GentleImageFlowSettings } from '../types.js';
export interface ProviderHealthReport {
    id: string;
    name: string;
    api: string;
    keySource: 'env' | 'settings' | 'missing';
    status: 'ready' | 'needs_key' | 'unreachable';
    message: string;
}
export declare class SetupWizard {
    static inspectProviders(settings: GentleImageFlowSettings): ProviderHealthReport[];
    static formatReportText(reports: ProviderHealthReport[], defaultModel?: string): string;
}
//# sourceMappingURL=setup.d.ts.map