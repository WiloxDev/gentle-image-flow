export interface SniffedImageInfo {
    mimeType: string;
    extension: string;
    width?: number;
    height?: number;
}
export declare class AssetOptimizer {
    static sniffFormat(bytes: Uint8Array): SniffedImageInfo;
}
//# sourceMappingURL=optimizer.d.ts.map