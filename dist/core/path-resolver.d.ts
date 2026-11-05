export interface PathResolutionResult {
    valid: boolean;
    resolvedPath?: string;
    error?: string;
}
export declare class UniversalPathResolver {
    private allowedRoots;
    constructor(cwd: string, extraAllowedDirectories?: string[]);
    expandAndNormalize(targetPath: string, baseCwd: string): string;
    resolveSafeInputPath(rawPath: string, baseCwd: string): Promise<PathResolutionResult>;
    /**
     * Genera el URI apropiado para enlaces Markdown según la plataforma
     */
    static formatMarkdownUri(filePath: string): string;
}
//# sourceMappingURL=path-resolver.d.ts.map