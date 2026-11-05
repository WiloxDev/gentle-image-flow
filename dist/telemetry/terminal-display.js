import { spawn } from 'node:child_process';
import { UniversalPathResolver } from '../core/path-resolver.js';
export class TerminalDisplayEngine {
    static detectGraphicCapability() {
        const term = (process.env.TERM || '').toLowerCase();
        const termProgram = (process.env.TERM_PROGRAM || '').toLowerCase();
        if (termProgram.includes('kitty') || term.includes('kitty')) {
            return 'kitty';
        }
        if (termProgram.includes('iterm') || termProgram.includes('wezterm')) {
            return 'iterm2';
        }
        if (term.includes('sixel') || process.env.SIXEL === '1') {
            return 'sixel';
        }
        return 'none';
    }
    /**
     * Genera la representación visual apropiada para el resultado del tool
     */
    static formatVisualOutput(filePath, altText, revisedPrompt) {
        const uri = UniversalPathResolver.formatMarkdownUri(filePath);
        const lines = [];
        lines.push(`![${altText}](${uri})`);
        // Añadir hipervínculo clickeable ANSI OSC 8 como comodidad extra en terminales compatibles
        const osc8Link = `\x1b]8;;${uri}\x1b\\Abrir archivo (${filePath})\x1b]8;;\x1b\\`;
        lines.push(`*Ubicación:* ${osc8Link}`);
        if (revisedPrompt) {
            lines.push(`> *Prompt ajustado por el modelo:* "${revisedPrompt}"`);
        }
        return lines.join('\n');
    }
    /**
     * Abre la imagen generada en el visor por defecto del sistema operativo de manera desacoplada
     */
    static openInSystemViewer(filePath) {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const isLinux = process.platform === 'linux';
        try {
            if (isWindows) {
                spawn('powershell.exe', ['-NoProfile', '-Command', `Start-Process "${filePath}"`], {
                    detached: true,
                    stdio: 'ignore',
                }).unref();
            }
            else if (isMac) {
                spawn('open', [filePath], {
                    detached: true,
                    stdio: 'ignore',
                }).unref();
            }
            else if (isLinux) {
                if (process.env.DISPLAY || process.env.WAYLAND_DISPLAY) {
                    spawn('xdg-open', [filePath], {
                        detached: true,
                        stdio: 'ignore',
                    }).unref();
                }
            }
        }
        catch {
            // Ignorar silenciosamente si no hay visor disponible en entornos headless
        }
    }
}
//# sourceMappingURL=terminal-display.js.map