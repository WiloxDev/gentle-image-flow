import type { ExecutionLifecycleState, LifecycleProgress } from '../types.js';

export type OnProgressCallback = (progress: LifecycleProgress) => void;

export class LifecycleManager {
  private state: ExecutionLifecycleState = 'queued';
  private startTime: number = Date.now();
  private timer: NodeJS.Timeout | null = null;
  private readonly model: string;
  private readonly provider: string;
  private readonly onProgress?: OnProgressCallback;

  constructor(model: string, provider: string, onProgress?: OnProgressCallback) {
    this.model = model;
    this.provider = provider;
    this.onProgress = onProgress;
  }

  public start(): void {
    this.startTime = Date.now();
    this.transition('connecting', `Conectando con ${this.provider} (${this.model})...`);

    // Actualizador de pulso de tiempo transcurrido cada 1 segundo
    this.timer = setInterval(() => {
      if (this.state === 'generating' || this.state === 'connecting') {
        const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
        let msg = `Generando imagen con ${this.provider} (${this.model})... ${elapsedSec}s`;
        if (elapsedSec > 35) {
          msg += ' (el proveedor está tardando más de lo habitual, esperando respuesta...)';
        }
        this.emit(this.state, msg);
      }
    }, 1000);
  }

  public transition(state: ExecutionLifecycleState, message?: string): void {
    this.state = state;
    const elapsed = Date.now() - this.startTime;
    const defaultMessages: Record<ExecutionLifecycleState, string> = {
      queued: 'En cola...',
      validating: 'Validando parámetros y referencias de imagen...',
      connecting: `Conectando con ${this.provider}...`,
      generating: `Procesando síntesis de imagen en ${this.provider}...`,
      optimizing: 'Descargando y optimizando assets en disco...',
      completed: `Completado en ${(elapsed / 1000).toFixed(1)}s.`,
      failed: 'La generación falló.',
    };

    this.emit(state, message || defaultMessages[state]);

    if (state === 'completed' || state === 'failed') {
      this.cleanup();
    }
  }

  private emit(state: ExecutionLifecycleState, message: string): void {
    if (this.onProgress) {
      this.onProgress({
        state,
        model: this.model,
        provider: this.provider,
        elapsedMs: Date.now() - this.startTime,
        message,
      });
    }
  }

  public cleanup(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
