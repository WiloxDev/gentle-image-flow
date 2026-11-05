import type { NormalizedGenerateParams, ProviderEndpoint, RawImageResult } from '../types.js';
import type { ImageProviderAdapter, ValidationResult } from './adapter.js';
export declare class OpenAiProviderAdapter implements ImageProviderAdapter {
    readonly api = "openai";
    validateParams(_endpoint: ProviderEndpoint, _remoteModelId: string, params: NormalizedGenerateParams): ValidationResult;
    generate(endpoint: ProviderEndpoint, remoteModelId: string, params: NormalizedGenerateParams, signal?: AbortSignal): Promise<RawImageResult[]>;
    private generateFromText;
    private generateEdits;
}
//# sourceMappingURL=openai.d.ts.map