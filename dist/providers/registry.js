import { DashscopeProviderAdapter } from './dashscope.js';
import { GeminiProviderAdapter } from './gemini.js';
import { OpenAiProviderAdapter } from './openai.js';
export class ProviderRegistry {
    static adapters = new Map();
    static {
        this.register(new OpenAiProviderAdapter());
        this.register(new GeminiProviderAdapter());
        this.register(new DashscopeProviderAdapter());
    }
    static register(adapter) {
        this.adapters.set(adapter.api.toLowerCase(), adapter);
    }
    static getAdapter(api) {
        const key = api.toLowerCase();
        const adapter = this.adapters.get(key);
        if (!adapter) {
            throw new Error(`Proveedor de API no soportado: "${api}". Proveedores soportados: ${Array.from(this.adapters.keys()).join(', ')}`);
        }
        return adapter;
    }
}
//# sourceMappingURL=registry.js.map