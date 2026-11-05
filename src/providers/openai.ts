import type {
  NormalizedGenerateParams,
  ProviderEndpoint,
  RawImageResult,
} from '../types.js';
import type { ImageProviderAdapter, ValidationResult } from './adapter.js';

export class OpenAiProviderAdapter implements ImageProviderAdapter {
  public readonly api = 'openai';

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
    const baseUrl = endpoint.baseUrl.replace(/\/+$/, '');
    const headers: Record<string, string> = {
      ...(endpoint.apiKey ? { authorization: `Bearer ${endpoint.apiKey}` } : {}),
      ...(endpoint.headers ?? {}),
    };

    // Caso A: Con imágenes de entrada (Edición / Img2Img)
    if (params.images && params.images.length > 0) {
      return this.generateEdits(baseUrl, headers, remoteModelId, params, signal);
    }

    // Caso B: Text-to-Image directo
    return this.generateFromText(baseUrl, headers, remoteModelId, params, signal);
  }

  private async generateFromText(
    baseUrl: string,
    headers: Record<string, string>,
    remoteModelId: string,
    params: NormalizedGenerateParams,
    signal?: AbortSignal
  ): Promise<RawImageResult[]> {
    const url = `${baseUrl}/images/generations`;

    let size = params.size;
    if (!size && params.aspectRatio) {
      // Conversión semántica ratio -> píxeles estándar
      size = params.aspectRatio === '16:9' ? '1792x1024' : params.aspectRatio === '9:16' ? '1024x1792' : '1024x1024';
    }

    const payload: Record<string, any> = {
      model: remoteModelId,
      prompt: params.prompt,
      n: params.n ?? 1,
      response_format: 'b64_json', // Favorece base64 para evitar depender de URLs públicas externas
    };

    if (size) payload.size = size;
    if (params.quality) payload.quality = params.quality;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`OpenAI Provider error (${res.status}): ${errText}`);
    }

    const json = (await res.json()) as any;
    const items = json.data ?? [];
    return items.map((item: any) => {
      if (item.b64_json) {
        return {
          data: { kind: 'base64', base64: item.b64_json, mimeType: 'image/png' },
          revisedPrompt: item.revised_prompt,
        };
      }
      return {
        data: { kind: 'url', url: item.url },
        revisedPrompt: item.revised_prompt,
      };
    });
  }

  private async generateEdits(
    baseUrl: string,
    headers: Record<string, string>,
    remoteModelId: string,
    params: NormalizedGenerateParams,
    signal?: AbortSignal
  ): Promise<RawImageResult[]> {
    const url = `${baseUrl}/images/edits`;
    const form = new FormData();

    form.append('model', remoteModelId);

    // Enriquecer el prompt con el rol de cada imagen para desambiguar
    let contextualPrompt = params.prompt;
    if (params.images && params.images.length > 1) {
      const roleNotes = params.images
        .map((img, i) => `Image ${i + 1} role: ${img.role}`)
        .join('; ');
      contextualPrompt = `[${roleNotes}] ${params.prompt}`;
    }
    form.append('prompt', contextualPrompt);
    form.append('n', String(params.n ?? 1));
    form.append('response_format', 'b64_json');

    if (params.size) form.append('size', params.size);
    if (params.quality) form.append('quality', params.quality);

    for (let i = 0; i < params.images!.length; i++) {
      const img = params.images![i];
      if (img.bytes) {
        const ext = img.mimeType ? img.mimeType.split('/')[1] : 'png';
        const blob = new Blob([Buffer.from(img.bytes)], { type: img.mimeType || 'image/png' });
        const field = params.images!.length > 1 ? 'image[]' : 'image';
        form.append(field, blob, `input-${i + 1}.${ext}`);
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: form,
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`OpenAI Provider Edit error (${res.status}): ${errText}`);
    }

    const json = (await res.json()) as any;
    const items = json.data ?? [];
    return items.map((item: any) => {
      if (item.b64_json) {
        return {
          data: { kind: 'base64', base64: item.b64_json, mimeType: 'image/png' },
          revisedPrompt: item.revised_prompt,
        };
      }
      return {
        data: { kind: 'url', url: item.url },
        revisedPrompt: item.revised_prompt,
      };
    });
  }
}
