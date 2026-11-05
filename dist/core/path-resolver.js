import { constants } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, normalize, relative, resolve } from 'node:path';
export class UniversalPathResolver {
    allowedRoots = [];
    constructor(cwd, extraAllowedDirectories = []) {
        const home = homedir();
        const defaults = [
            cwd,
            resolve(home, 'Pictures'),
            resolve(home, 'Downloads'),
            resolve(home, 'Desktop'),
        ];
        const combined = [...defaults, ...extraAllowedDirectories];
        this.allowedRoots = combined.map((p) => this.expandAndNormalize(p, cwd));
    }
    expandAndNormalize(targetPath, baseCwd) {
        let p = targetPath.trim();
        if (p.startsWith('~')) {
            p = resolve(homedir(), p.slice(1).replace(/^[/\\]/, ''));
        }
        // Compatibilidad WSL: Traducir rutas Windows "C:\..." a "/mnt/c/..." en Linux
        if (process.platform === 'linux' && /^[a-zA-Z]:[/\\]/.test(p)) {
            const drive = p[0].toLowerCase();
            const rest = p.slice(2).replace(/\\/g, '/');
            p = `/mnt/${drive}${rest}`;
        }
        if (!isAbsolute(p)) {
            p = resolve(baseCwd, p);
        }
        return normalize(p);
    }
    async resolveSafeInputPath(rawPath, baseCwd) {
        const candidate = this.expandAndNormalize(rawPath, baseCwd);
        // Comprobar si el candidato se encuentra dentro de alguna de las raíces permitidas
        let isAllowed = false;
        for (const root of this.allowedRoots) {
            const rel = relative(root, candidate);
            if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) {
                isAllowed = true;
                break;
            }
        }
        if (!isAllowed) {
            return {
                valid: false,
                error: `La ruta "${rawPath}" está fuera de los directorios autorizados (${this.allowedRoots.join(', ')}). Configura "allowedDirectories" en settings.json para autorizar carpetas adicionales.`,
            };
        }
        try {
            const statInfo = await lstat(candidate);
            if (!statInfo.isFile() && !statInfo.isSymbolicLink()) {
                return {
                    valid: false,
                    error: `"${rawPath}" no es un archivo regular válido.`,
                };
            }
            // Resolver enlace simbólico si existe
            const canonical = await realpath(candidate);
            const canonicalStat = await lstat(canonical);
            if (!canonicalStat.isFile()) {
                return {
                    valid: false,
                    error: `El destino de "${rawPath}" no es un archivo regular.`,
                };
            }
            // Validar descriptor de lectura
            const file = await open(canonical, constants.O_RDONLY);
            await file.close();
            return {
                valid: true,
                resolvedPath: canonical,
            };
        }
        catch (err) {
            return {
                valid: false,
                error: `No fue posible acceder al archivo "${rawPath}": ${err instanceof Error ? err.message : String(err)}`,
            };
        }
    }
    /**
     * Genera el URI apropiado para enlaces Markdown según la plataforma
     */
    static formatMarkdownUri(filePath) {
        const normalized = normalize(filePath);
        if (process.platform === 'win32') {
            // RFC 8089 para Windows
            const slashPath = normalized.replace(/\\/g, '/');
            return `file:///${slashPath}`;
        }
        return normalized;
    }
}
//# sourceMappingURL=path-resolver.js.map