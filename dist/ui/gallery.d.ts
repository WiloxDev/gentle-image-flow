export interface GalleryItem {
    id: string;
    path: string;
    filename: string;
    model: string;
    prompt: string;
    timestamp: Date;
    sizeBytes: number;
}
export declare class SessionGallery {
    private static items;
    static add(item: Omit<GalleryItem, 'id' | 'timestamp'>): void;
    static list(): GalleryItem[];
    static formatGalleryText(): string;
}
//# sourceMappingURL=gallery.d.ts.map