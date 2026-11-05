import type {
  NormalizedGenerateParams,
  ProviderEndpoint,
  RawImageResult,
} from '../types.js';
import type { ImageProviderAdapter, ValidationResult } from './adapter.js';

export class DashscopeProviderAdapter implements ImageProviderAdapter {
  public readonly api = 'dashscope';

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
    const baseUrl = (endpoint.baseUrl || 'https://dashscope-intl.aliyuncs.com/api/v1').replace(/\/+$/, '');
    const apiKey = endpoint.apiKey;
    if (!apiKey) {
      throw new Error('Se requiere DASHSCOPE_API_KEY o apiKey configurada para DashScope.');
    }

    const url = `${baseUrl}/services/aigc/text2image/image-synthesis`;

    // Normalizar a formato con asterisco <width>*<height>
    let size = params.size;
    if (size) {
      size = size.replace(/\s*x\s*/i, '*');
    } else if (params.aspectRatio) {
      size = params.aspectRatio === '16:9' ? '1280*720' : params.aspectRatio === '9:16' ? '720*1280' : '1024*1024';
    } else {
      size = '1024*1024';
    }

    const payload: Record<string, any> = {
      model: remoteModelId,
      input: {
        prompt: params.prompt,
      },
      parameters: {
        size,
        n: Math.min(params.n ?? 1, 4),
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'X-DashScope-Async': 'enable',
        ...(endpoint.headers ?? {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`DashScope Provider error (${res.status}): ${errText}`);
    }

    const json = (await res.json()) as any;
    const taskId = json.output?.task_id;
    if (!taskId) {
      throw new Error('DashScope no devolvió un task_id válido.');
    }

    // Polling ordenado de la tarea asíncrona
    return this.pollTask(baseUrl, apiKey, taskId, signal);
  }

  private async pollTask(
    baseUrl: string,
    apiKey: string,
    taskId: string,
    signal?: AbortSignal
  ): Promise<RawImageResult[]> {
    const pollUrl = `${baseUrl}/tasks/${taskId}`;
    const start = Date.now();
    const timeoutMs = 60000; // 60 segundos máximo

    while (Date.now() - start < timeoutMs) {
      if (signal?.aborted) throw new Error('Operación cancelada por el usuario.');

      await new Promise((r) => setTimeout(r, 1500));

      const res = await fetch(pollUrl, {
        headers: { authorization: `Bearer ${apiKey}` },
        signal,
      });

      if (!res.ok) continue;

      const data = (await res.json()) as any;
      const status = data.output?.task_status;

      if (status === 'SUCCEEDED') {
        const results = data.output?.results ?? [];
        return results.map((r: any) => ({
          data: { kind: 'url', url: r.url },
        }));
      }

      if (status === 'FAILED' || status === 'CANCELED') {
        throw new Error(`DashScope tarea ${status}: ${data.output?.message || 'Error desconocido'}`);
      }
    }

    throw new Error('Timeout esperando la generación de imagen en DashScope.');
  }
}
