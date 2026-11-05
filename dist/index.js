import { readFile } from 'node:fs/promises';
import { runListCommand } from './commands/list.js';
import { SetupWizard } from './commands/setup.js';
import { ImageGenerateToolSchema } from './core/contracts.js';
import { UniversalPathResolver } from './core/path-resolver.js';
import { ProviderRegistry } from './providers/registry.js';
import { AssetOptimizer } from './storage/optimizer.js';
import { AssetStorageManager } from './storage/store.js';
import { LifecycleManager } from './telemetry/lifecycle.js';
import { TerminalDisplayEngine } from './telemetry/terminal-display.js';
import { SessionGallery } from './ui/gallery.js';
export default function gentleImageFlowExtension(pi) {
    let settings = {};
    const sessionCwd = process.cwd();
    // Cargar configuración de settings si está disponible
    const loadConfig = () => {
        try {
            if (typeof pi.getSettings === 'function') {
                settings = pi.getSettings('gentle-image-flow') || pi.getSettings('pi-image-gen') || {};
            }
        }
        catch {
            settings = {};
        }
    };
    loadConfig();
    // Registrar Tool principal: image_generate
    pi.registerTool({
        name: 'image_generate',
        label: 'ImageFlow',
        description: 'Genera o edita imágenes digitales con control multiplataforma (Windows, Linux, macOS). Soporta override de modelo ("model"), referencias de imagen con roles explícitos ("images": [{"path", "role"}]), tamaños normalizados y apertura automática opcional ("openAfter").',
        parameters: ImageGenerateToolSchema,
        async execute(_toolCallId, rawParams, signal, onUpdate, ctx) {
            const cwd = ctx?.cwd ?? sessionCwd;
            loadConfig();
            const modelId = (rawParams.model || settings.defaultModel || 'nano-banana').trim();
            const outputDir = rawParams.outputDir || settings.outputDir || '.pi/images';
            const pathResolver = new UniversalPathResolver(cwd, settings.allowedDirectories ?? []);
            // Resolver proveedor y endpoint
            const providerApi = resolveProviderApi(modelId, settings);
            const endpoint = resolveEndpoint(providerApi, modelId, settings);
            const adapter = ProviderRegistry.getAdapter(providerApi);
            // Iniciar máquina de estados de ciclo de vida
            const lifecycle = new LifecycleManager(modelId, endpoint.name || providerApi, (progress) => {
                if (onUpdate) {
                    onUpdate({
                        content: [{ type: 'text', text: `[Gentle Image Flow] ${progress.message}` }],
                    });
                }
            });
            lifecycle.start();
            try {
                lifecycle.transition('validating');
                // Procesar y validar imágenes de entrada si existen
                const processedImages = [];
                if (rawParams.images && rawParams.images.length > 0) {
                    for (const item of rawParams.images) {
                        const resolved = await pathResolver.resolveSafeInputPath(item.path, cwd);
                        if (!resolved.valid || !resolved.resolvedPath) {
                            throw new Error(`Referencia de imagen inválida: ${resolved.error}`);
                        }
                        const bytes = await readFile(resolved.resolvedPath);
                        const format = AssetOptimizer.sniffFormat(bytes);
                        processedImages.push({
                            path: resolved.resolvedPath,
                            role: item.role || 'style_reference',
                            mimeType: format.mimeType,
                            bytes,
                        });
                    }
                }
                const normalizedParams = {
                    prompt: rawParams.prompt,
                    model: modelId,
                    images: processedImages,
                    size: rawParams.size,
                    aspectRatio: rawParams.aspectRatio,
                    imageSize: rawParams.imageSize,
                    quality: rawParams.quality,
                    n: rawParams.n ?? 1,
                    filename: rawParams.filename,
                    outputDir,
                    openAfter: rawParams.openAfter ?? settings.autoOpen,
                };
                const validation = adapter.validateParams(endpoint, modelId, normalizedParams);
                if (!validation.valid && validation.errors?.length) {
                    throw new Error(`Parámetros inválidos para ${modelId}: ${validation.errors.join(', ')}`);
                }
                lifecycle.transition('generating', `Sintetizando imagen con ${endpoint.name || providerApi}...`);
                const rawResults = await adapter.generate(endpoint, modelId, normalizedParams, signal);
                if (!rawResults || rawResults.length === 0) {
                    throw new Error('El proveedor no devolvió ninguna imagen.');
                }
                lifecycle.transition('optimizing');
                const storage = new AssetStorageManager(outputDir);
                const savedPaths = [];
                const visualOutputs = [];
                for (let i = 0; i < rawResults.length; i++) {
                    const raw = rawResults[i];
                    let imageBytes;
                    if (raw.data.kind === 'base64') {
                        imageBytes = Buffer.from(raw.data.base64, 'base64');
                    }
                    else {
                        // Descargar URL
                        const res = await fetch(raw.data.url, { signal });
                        if (!res.ok)
                            throw new Error(`Fallo al descargar la imagen generada (${res.status})`);
                        imageBytes = new Uint8Array(await res.arrayBuffer());
                    }
                    const format = AssetOptimizer.sniffFormat(imageBytes);
                    const baseName = rawParams.filename || `${modelId}-${Date.now()}`;
                    const suffix = rawResults.length > 1 ? `-${i + 1}` : '';
                    const saved = await storage.save(imageBytes, format.extension, {
                        filename: `${baseName}${suffix}`,
                    });
                    savedPaths.push(saved.fullPath);
                    // Registrar en la galería de la sesión
                    SessionGallery.add({
                        path: saved.fullPath,
                        filename: saved.filename,
                        model: modelId,
                        prompt: rawParams.prompt,
                        sizeBytes: saved.sizeBytes,
                    });
                    // Formatear visualización adaptativa (OSC 8 / Markdown / SO Viewer)
                    const formatted = TerminalDisplayEngine.formatVisualOutput(saved.fullPath, saved.filename, raw.revisedPrompt);
                    visualOutputs.push(formatted);
                    // Auto-abrir si fue solicitado
                    if (normalizedParams.openAfter) {
                        TerminalDisplayEngine.openInSystemViewer(saved.fullPath);
                    }
                }
                lifecycle.transition('completed', `Generada(s) ${savedPaths.length} imagen(es) con éxito.`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `✨ Generated ${savedPaths.length} image(s) via Gentle Image Flow (${modelId}):\n\n${visualOutputs.join('\n\n')}`,
                        },
                    ],
                    details: {
                        model: modelId,
                        provider: providerApi,
                        images: savedPaths,
                        count: savedPaths.length,
                    },
                };
            }
            catch (err) {
                lifecycle.transition('failed', err.message);
                throw err;
            }
            finally {
                lifecycle.cleanup();
            }
        },
    });
    // Registrar Slash Commands para Gentle-Shell y Pi
    if (typeof pi.registerCommand === 'function') {
        pi.registerCommand({
            name: 'gif',
            description: 'Gentle Image Flow: gestión de imágenes, setup, galería y listado.',
            execute(args, ctx) {
                loadConfig();
                const sub = (args || '').trim().split(' ')[0].toLowerCase();
                if (sub === 'setup') {
                    const reports = SetupWizard.inspectProviders(settings);
                    ctx?.ui?.notify(SetupWizard.formatReportText(reports, settings.defaultModel));
                    return;
                }
                if (sub === 'gallery') {
                    ctx?.ui?.notify(SessionGallery.formatGalleryText());
                    return;
                }
                // Por defecto: /gif list
                ctx?.ui?.notify(runListCommand(settings));
            },
        });
        pi.registerCommand({
            name: 'image-flow',
            description: 'Alias canónico para /gif',
            execute(args, ctx) {
                const gifCmd = pi.commands?.get?.('gif');
                if (gifCmd)
                    gifCmd.execute(args, ctx);
            },
        });
    }
}
function resolveProviderApi(modelId, settings) {
    const m = modelId.toLowerCase();
    if (m.includes('banana') || m.includes('gemini'))
        return 'gemini';
    if (m.includes('qwen'))
        return 'dashscope';
    if (m.includes('gpt-image') || m.includes('dall-e') || m.includes('sdxl') || m.includes('sd3') || m.includes('flux')) {
        return 'openai';
    }
    // Buscar en customProviders
    if (settings.customProviders) {
        for (const custom of Object.values(settings.customProviders)) {
            if (custom.api)
                return custom.api;
        }
    }
    return 'openai';
}
function resolveEndpoint(api, modelId, settings) {
    // 1. Priorizar customProviders si el modelo coincide o si hay un custom provider para esta API
    if (settings.customProviders) {
        for (const [id, custom] of Object.entries(settings.customProviders)) {
            if (id === modelId || custom.id === modelId || custom.api === api) {
                const key = custom.apiKey?.startsWith('$') ? process.env[custom.apiKey.slice(1)] : custom.apiKey;
                return {
                    id: custom.id || id,
                    api: custom.api,
                    baseUrl: custom.baseUrl,
                    apiKey: key,
                    headers: custom.headers,
                    name: custom.name || id,
                };
            }
        }
    }
    const defaultBaseUrls = {
        openai: 'https://api.openai.com/v1',
        gemini: 'https://generativelanguage.googleapis.com/v1beta',
        dashscope: 'https://dashscope-intl.aliyuncs.com/api/v1',
        openrouter: 'https://openrouter.ai/api/v1',
    };
    const defaultKeys = {
        openai: process.env.OPENAI_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        dashscope: process.env.DASHSCOPE_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
    };
    const override = settings.providers?.[api] ?? {};
    return {
        id: api,
        api: api,
        baseUrl: override.baseUrl || defaultBaseUrls[api] || 'https://api.openai.com/v1',
        apiKey: override.apiKey || defaultKeys[api],
        headers: override.headers,
        name: api.toUpperCase(),
    };
}
//# sourceMappingURL=index.js.map