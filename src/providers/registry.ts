import type { ProviderApiStyle } from '../types.js';
import type { ImageProviderAdapter } from './adapter.js';
import { DashscopeProviderAdapter } from './dashscope.js';
import { GeminiProviderAdapter } from './gemini.js';
import { OpenAiProviderAdapter } from './openai.js';

export class ProviderRegistry {
  private static adapters: Map<string, ImageProviderAdapter> = new Map();

  static {
    this.register(new OpenAiProviderAdapter());
    this.register(new GeminiProviderAdapter());
    this.register(new DashscopeProviderAdapter());
  }

  public static register(adapter: ImageProviderAdapter): void {
    this.adapters.set(adapter.api.toLowerCase(), adapter);
  }

  public static getAdapter(api: ProviderApiStyle | string): ImageProviderAdapter {
    const key = api.toLowerCase();
    const adapter = this.adapters.get(key);
    if (!adapter) {
      throw new Error(`Proveedor de API no soportado: "${api}". Proveedores soportados: ${Array.from(this.adapters.keys()).join(', ')}`);
    }
    return adapter;
  }
}
