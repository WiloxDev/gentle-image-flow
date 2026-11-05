import type {
  NormalizedGenerateParams,
  ProviderEndpoint,
  RawImageResult,
} from '../types.js';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface ImageProviderAdapter {
  readonly api: string;
  validateParams(
    endpoint: ProviderEndpoint,
    remoteModelId: string,
    params: NormalizedGenerateParams
  ): ValidationResult;
  generate(
    endpoint: ProviderEndpoint,
    remoteModelId: string,
    params: NormalizedGenerateParams,
    signal?: AbortSignal
  ): Promise<RawImageResult[]>;
}
