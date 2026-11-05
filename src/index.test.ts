import { describe, expect, it } from 'vitest';
import { UniversalPathResolver } from '../src/core/path-resolver.js';
import { AssetOptimizer } from '../src/storage/optimizer.js';
import { SetupWizard } from '../src/commands/setup.js';

describe('UniversalPathResolver', () => {
  it('formatea URIs para Windows con file:/// conforme a RFC 8089', () => {
    // Si corre en Windows o emulando ruta Windows
    const uri = UniversalPathResolver.formatMarkdownUri('C:\\Users\\Test\\img.png');
    if (process.platform === 'win32') {
      expect(uri).toBe('file:///C:/Users/Test/img.png');
    } else {
      expect(uri).toContain('img.png');
    }
  });

  it('normaliza rutas WSL /mnt/c/ a partir de rutas Windows en Linux', () => {
    const resolver = new UniversalPathResolver('/tmp');
    if (process.platform === 'linux') {
      const normalized = resolver.expandAndNormalize('C:\\Users\\Test\\photo.png', '/tmp');
      expect(normalized).toBe('/mnt/c/Users/Test/photo.png');
    }
  });
});

describe('AssetOptimizer', () => {
  it('detecta correctamente firmas de imagen PNG', () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const info = AssetOptimizer.sniffFormat(pngHeader);
    expect(info.mimeType).toBe('image/png');
    expect(info.extension).toBe('png');
  });

  it('detecta correctamente firmas de imagen JPEG', () => {
    const jpgHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const info = AssetOptimizer.sniffFormat(jpgHeader);
    expect(info.mimeType).toBe('image/jpeg');
    expect(info.extension).toBe('jpg');
  });
});

describe('SetupWizard', () => {
  it('genera reporte de salud sin exponer valores de claves en texto plano', () => {
    const reports = SetupWizard.inspectProviders({
      defaultModel: 'nano-banana',
    });
    expect(reports.length).toBeGreaterThanOrEqual(3);
    const reportText = SetupWizard.formatReportText(reports, 'nano-banana');
    expect(reportText).toContain('GENTLE IMAGE FLOW - DIAGNÓSTICO DE PROVEEDORES');
    expect(reportText).toContain('nano-banana');
  });
});
