/**
 * Engram Style Memory Bridge (Loose Coupling)
 *
 * Conecta de forma opcional y transparente con la memoria Engram de Gentle-Shell / Pi.
 * Si las tools de Engram no están disponibles en la sesión, se comporta como un no-op
 * sin emitir errores ni bloquear el flujo.
 */
export interface StylePreference {
    aspectRatioPreference?: string;
    lightingPreference?: string;
    palettePreference?: string;
    negativeConstraints?: string[];
}
export declare class EngramStyleBridge {
    static queryActiveStylePreferences(searchTool?: (args: {
        query: string;
        topic_key?: string;
    }) => Promise<any>): Promise<string[]>;
    static recordFeedback(feedback: string, saveTool?: (args: {
        title: string;
        content: string;
        topic_key: string;
        type: string;
        scope: string;
    }) => Promise<any>): Promise<void>;
}
//# sourceMappingURL=engram-hook.d.ts.map