import type { NormalizedGenerateParams, ProviderEndpoint, RawImageResult } from '../types.js';
import type { ImageProviderAdapter, ValidationResult } from './adapter.js';
export declare class GeminiProviderAdapter implements ImageProviderAdapter {
    readonly api = "gemini";
    validateParams(_endpoint: ProviderEndpoint, _remoteModelId: string, params: NormalizedGenerateParams): ValidationResult;
    generate(endpoint: ProviderEndpoint, remoteModelId: string, params: NormalizedGenerateParams, signal?: AbortSignal): Promise<RawImageResult[]>;
}
//# sourceMappingURL=gemini.d.ts.map