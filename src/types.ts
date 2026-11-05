/**
 * Gentle Image Flow - Tipos y Contratos Centrales
 */

export type ImageRole = 'style_reference' | 'edit_target' | 'subject_reference';

export interface ImageInputItem {
  path: string;
  role: ImageRole;
  mimeType?: string;
  bytes?: Uint8Array;
}

export type ProviderApiStyle = 'openai' | 'gemini' | 'dashscope' | 'ark' | 'openrouter';

export interface NormalizedGenerateParams {
  prompt: string;
  model?: string; // Override dinámico opcional por llamada
  images?: ImageInputItem[];
  size?: string; // ej. "1024x1024", "1920x1080" o "2048*2048"
  aspectRatio?: string; // ej. "1:1", "16:9", "9:16", "4:3", "3:4"
  imageSize?: '1K' | '2K' | '4K';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  n?: number;
  filename?: string;
  outputDir?: string;
  openAfter?: boolean; // Abrir en visor nativo del SO
}

export interface ProviderEndpoint {
  id: string;
  api: ProviderApiStyle;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  name?: string;
  builtIn?: boolean;
}

export interface RawImageResult {
  data:
    | { kind: 'url'; url: string }
    | { kind: 'base64'; base64: string; mimeType: string };
  revisedPrompt?: string;
}

export interface GeneratedImage {
  path: string;
  mimeType: string;
  previewPath?: string; // WebP ultraligero de 50 KB para previews
  revisedPrompt?: string;
  width?: number;
  height?: number;
}

export interface GentleImageFlowSettings {
  defaultModel?: string;
  outputDir?: string;
  allowedDirectories?: string[]; // Directorios permitidos además de cwd (ej. ["~/Pictures", "~/Downloads"])
  autoOpen?: boolean; // Abrir automáticamente en visor del SO
  enableWebPPreview?: boolean; // Generar thumbnail webp automático (def: true)
  providers?: Record<string, Partial<ProviderEndpoint>>;
  customProviders?: Record<string, ProviderEndpoint>;
}

export type ExecutionLifecycleState =
  | 'queued'
  | 'validating'
  | 'connecting'
  | 'generating'
  | 'optimizing'
  | 'completed'
  | 'failed';

export interface LifecycleProgress {
  state: ExecutionLifecycleState;
  model: string;
  provider: string;
  elapsedMs: number;
  message: string;
}
