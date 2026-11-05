import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { mkdir, open, readdir, stat, unlink } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

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

export class AssetStorageManager {
  private baseDir: string;

  constructor(baseOutputDir: string = '.pi/images') {
    this.baseDir = resolve(baseOutputDir);
  }

  public async save(
    bytes: Uint8Array,
    extension: string = 'png',
    options: SaveImageOptions = {}
  ): Promise<StoredImageResult> {
    const tier = options.isApproved ? 'approved' : 'staging';
    const targetDir = options.outputDir ? resolve(options.outputDir) : join(this.baseDir, tier);

    await mkdir(targetDir, { recursive: true });

    // Calcular hash SHA-256
    const hash = createHash('sha256').update(bytes).digest('hex');

    // Sanitizar nombre base
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeBaseName = options.filename
      ? options.filename.replace(/[^a-zA-Z0-9_-]/g, '_')
      : `img-${stamp}`;

    let version = 1;
    let chosenPath = '';

    while (version < 1000) {
      const suffix = version === 1 ? '' : `-v${version}`;
      const candidateName = `${safeBaseName}${suffix}.${extension}`;
      const candidatePath = join(targetDir, candidateName);

      try {
        // Reserva atómica con O_EXCL para evitar sobreescritura accidental
        const file = await open(candidatePath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
        await file.write(bytes);
        await file.close();
        chosenPath = candidatePath;
        break;
      } catch (err: any) {
        if (err.code === 'EEXIST') {
          version++;
          continue;
        }
        throw err;
      }
    }

    if (!chosenPath) {
      throw new Error('No fue posible reservar un nombre de archivo único para la imagen generada.');
    }

    return {
      fullPath: chosenPath,
      relativePath: join(tier, basename(chosenPath)),
      filename: basename(chosenPath),
      sha256: hash,
      sizeBytes: bytes.byteLength,
    };
  }

  /**
   * Limpia archivos de staging más antiguos que maxAgeDays (por defecto 7 días)
   */
  public async purgeStagingOlderThan(maxAgeDays: number = 7): Promise<number> {
    const stagingDir = join(this.baseDir, 'staging');
    let purgedCount = 0;

    try {
      const entries = await readdir(stagingDir);
      const now = Date.now();
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

      for (const entry of entries) {
        const fullPath = join(stagingDir, entry);
        const s = await stat(fullPath);
        if (s.isFile() && now - s.mtimeMs > maxAgeMs) {
          await unlink(fullPath);
          purgedCount++;
        }
      }
    } catch {
      // Si el directorio no existe, no hay nada que limpiar
    }

    return purgedCount;
  }
}
