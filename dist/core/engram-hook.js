/**
 * Engram Style Memory Bridge (Loose Coupling)
 *
 * Conecta de forma opcional y transparente con la memoria Engram de Gentle-Shell / Pi.
 * Si las tools de Engram no están disponibles en la sesión, se comporta como un no-op
 * sin emitir errores ni bloquear el flujo.
 */
export class EngramStyleBridge {
    static async queryActiveStylePreferences(searchTool) {
        if (!searchTool)
            return [];
        try {
            const res = await searchTool({
                query: 'image generation style preferences aesthetic',
                topic_key: 'image-style-preferences',
            });
            if (res && Array.isArray(res) && res.length > 0) {
                return res.map((r) => r.content || r.title).filter(Boolean);
            }
        }
        catch {
            // Degradar silenciosamente si Engram está inactivo
        }
        return [];
    }
    static async recordFeedback(feedback, saveTool) {
        if (!saveTool)
            return;
        try {
            await saveTool({
                title: 'Preferencia de Estilo de Imagen',
                content: feedback,
                topic_key: 'image-style-preferences',
                type: 'preference',
                scope: 'project',
            });
        }
        catch {
            // Degradar silenciosamente
        }
    }
}
//# sourceMappingURL=engram-hook.js.map