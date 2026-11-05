import type {
  NormalizedGenerateParams,
  ProviderEndpoint,
  RawImageResult,
} from '../types.js';
import type { ImageProviderAdapter, ValidationResult } from './adapter.js';

export class GeminiProviderAdapter implements ImageProviderAdapter {
  public readonly api = 'gemini';

  public validateParams(
    _endpoint: ProviderEndpoint,
    _remoteModelId: string,
    params: NormalizedGenerateParams
  ): ValidationResult {
    const errors: string[] = [];
    if (!params.prompt || params.prompt.trim().length === 0) {
      errors.push('El prompt no puede estar vacío.');
    }
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  public async generate(
    endpoint: ProviderEndpoint,
    remoteModelId: string,
    params: NormalizedGenerateParams,
    signal?: AbortSignal
  ): Promise<RawImageResult[]> {
    const baseUrl = (endpoint.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '');
    const apiKey = endpoint.apiKey;
    if (!apiKey) {
      throw new Error('Se requiere GEMINI_API_KEY o apiKey configurada para el proveedor Gemini.');
    }

    const url = `${baseUrl}/models/${remoteModelId}:generateImages?key=${apiKey}`;

    // Determinar ratio y resolución
    let aspectRatio = params.aspectRatio || '1:1';
    if (!params.aspectRatio && params.size) {
      const [w, h] = params.size.split(/[x*]/).map((v) => parseInt(v.trim(), 10));
      if (!isNaN(w) && !isNaN(h)) {
        const ratio = w / h;
        if (ratio > 1.6) aspectRatio = '16:9';
        else if (ratio < 0.65) aspectRatio = '9:16';
        else if (ratio > 1.25) aspectRatio = '4:3';
        else if (ratio < 0.8) aspectRatio = '3:4';
        else aspectRatio = '1:1';
      }
    }

    const imageGenerationConfig: Record<string, any> = {
      numberOfImages: params.n ?? 1,
      aspectRatio,
    };

    if (params.imageSize) {
      imageGenerationConfig.imageSize = params.imageSize;
    }

    const payload: Record<string, any> = {
      prompt: params.prompt,
      imageGenerationConfig,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(endpoint.headers ?? {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Gemini Provider error (${res.status}): ${errText}`);
    }

    const json = (await res.json()) as any;
    const generatedImages = json.generatedImages ?? [];

    return generatedImages.map((img: any) => {
      const b64 = img.image?.imageBytes;
      if (b64) {
        return {
          data: {
            kind: 'base64',
            base64: b64,
            mimeType: 'image/png',
          },
        };
      }
      throw new Error('Respuesta de imagen de Gemini inesperada sin imageBytes.');
    });
  }
}
