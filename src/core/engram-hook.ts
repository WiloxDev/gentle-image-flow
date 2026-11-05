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

export class EngramStyleBridge {
  public static async queryActiveStylePreferences(
    searchTool?: (args: { query: string; topic_key?: string }) => Promise<any>
  ): Promise<string[]> {
    if (!searchTool) return [];

    try {
      const res = await searchTool({
        query: 'image generation style preferences aesthetic',
        topic_key: 'image-style-preferences',
      });

      if (res && Array.isArray(res) && res.length > 0) {
        return res.map((r: any) => r.content || r.title).filter(Boolean);
      }
    } catch {
      // Degradar silenciosamente si Engram está inactivo
    }

    return [];
  }

  public static async recordFeedback(
    feedback: string,
    saveTool?: (args: { title: string; content: string; topic_key: string; type: string; scope: string }) => Promise<any>
  ): Promise<void> {
    if (!saveTool) return;

    try {
      await saveTool({
        title: 'Preferencia de Estilo de Imagen',
        content: feedback,
        topic_key: 'image-style-preferences',
        type: 'preference',
        scope: 'project',
      });
    } catch {
      // Degradar silenciosamente
    }
  }
}
