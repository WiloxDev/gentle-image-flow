import type { ProviderApiStyle } from '../types.js';
import type { ImageProviderAdapter } from './adapter.js';
export declare class ProviderRegistry {
    private static adapters;
    static register(adapter: ImageProviderAdapter): void;
    static getAdapter(api: ProviderApiStyle | string): ImageProviderAdapter;
}
//# sourceMappingURL=registry.d.ts.map