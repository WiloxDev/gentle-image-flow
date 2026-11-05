export class LifecycleManager {
    state = 'queued';
    startTime = Date.now();
    timer = null;
    model;
    provider;
    onProgress;
    constructor(model, provider, onProgress) {
        this.model = model;
        this.provider = provider;
        this.onProgress = onProgress;
    }
    start() {
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
    transition(state, message) {
        this.state = state;
        const elapsed = Date.now() - this.startTime;
        const defaultMessages = {
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
    emit(state, message) {
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
    cleanup() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}
//# sourceMappingURL=lifecycle.js.map