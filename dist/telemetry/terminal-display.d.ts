export type TerminalGraphicProtocol = 'kitty' | 'iterm2' | 'sixel' | 'none';
export declare class TerminalDisplayEngine {
    static detectGraphicCapability(): TerminalGraphicProtocol;
    /**
     * Genera la representación visual apropiada para el resultado del tool
     */
    static formatVisualOutput(filePath: string, altText: string, revisedPrompt?: string): string;
    /**
     * Abre la imagen generada en el visor por defecto del sistema operativo de manera desacoplada
     */
    static openInSystemViewer(filePath: string): void;
}
//# sourceMappingURL=terminal-display.d.ts.map