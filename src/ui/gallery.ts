export interface GalleryItem {
  id: string;
  path: string;
  filename: string;
  model: string;
  prompt: string;
  timestamp: Date;
  sizeBytes: number;
}

export class SessionGallery {
  private static items: GalleryItem[] = [];

  public static add(item: Omit<GalleryItem, 'id' | 'timestamp'>): void {
    this.items.unshift({
      ...item,
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
    });
  }

  public static list(): GalleryItem[] {
    return [...this.items];
  }

  public static formatGalleryText(): string {
    if (this.items.length === 0) {
      return 'No se han generado imágenes durante esta sesión. Usa la tool image_generate o /gif generate <prompt> para crear una.';
    }

    const lines: string[] = [];
    lines.push('╔══════════════════════════════════════════════════════════════════════╗');
    lines.push('║             GENTLE IMAGE FLOW - GALERÍA DE LA SESIÓN                 ║');
    lines.push('╚══════════════════════════════════════════════════════════════════════╝\n');

    this.items.forEach((item, index) => {
      const timeStr = item.timestamp.toLocaleTimeString();
      const kb = Math.round(item.sizeBytes / 1024);
      lines.push(`[#${index + 1}] ${item.filename} (${kb} KB) · ${item.model} · ${timeStr}`);
      lines.push(`     Ruta: ${item.path}`);
      lines.push(`     Prompt: "${item.prompt.slice(0, 80)}${item.prompt.length > 80 ? '...' : ''}"\n`);
    });

    lines.push('Tip: Copia la ruta de cualquier imagen anterior para usarla como referencia (role: edit_target o style_reference).');

    return lines.join('\n');
  }
}
