export interface SaveImageOptions {
    outputDir?: string;
    filename?: string;
    isApproved?: boolean;
}
export interface StoredImageResult {
    fullPath: string;
    relativePath: string;
    filename: string;
    sha256: string;
    sizeBytes: number;
}
export declare class AssetStorageManager {
    private baseDir;
    constructor(baseOutputDir?: string);
    save(bytes: Uint8Array, extension?: string, options?: SaveImageOptions): Promise<StoredImageResult>;
    /**
     * Limpia archivos de staging más antiguos que maxAgeDays (por defecto 7 días)
     */
    purgeStagingOlderThan(maxAgeDays?: number): Promise<number>;
}
//# sourceMappingURL=store.d.ts.map