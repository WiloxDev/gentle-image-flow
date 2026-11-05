import { createServer } from 'node:http';
import { readFile, rm } from 'node:fs/promises';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import gentleImageFlowExtension from './index.js';
import { SessionGallery } from './ui/gallery.js';

describe('Gentle Image Flow - End-to-End Live Tool Smoke Test', () => {
  let server: any;
  let serverPort: number;
  const mockBase64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  beforeAll(async () => {
    // Servidor simulador de API de imagen OpenAI-compatible
    server = createServer((req, res) => {
      if (req.url === '/v1/images/generations' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            data: [
              {
                b64_json: mockBase64Png,
                revised_prompt: 'A tiny neon cyber kitten with glowing whiskers',
              },
            ],
          })
        );
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        serverPort = (server.address() as any).port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    // Limpieza de staging de prueba
    await rm('.pi-test-images', { recursive: true, force: true }).catch(() => {});
  });

  it('ejecuta image_generate end-to-end, guarda en staging y registra en galería', async () => {
    let registeredTool: any = null;
    let registeredCommands: Map<string, any> = new Map();

    const mockPi = {
      registerTool(tool: any) {
        registeredTool = tool;
      },
      registerCommand(nameOrCmd: any, maybeOptions?: any) {
        if (typeof nameOrCmd === 'string') {
          registeredCommands.set(nameOrCmd, { name: nameOrCmd, ...maybeOptions });
        } else if (nameOrCmd && typeof nameOrCmd.name === 'string') {
          registeredCommands.set(nameOrCmd.name, nameOrCmd);
        }
      },
      getSettings() {
        return {
          defaultModel: 'test-dalle',
          outputDir: '.pi-test-images',
          customProviders: {
            mockProvider: {
              api: 'openai',
              baseUrl: `http://127.0.0.1:${serverPort}/v1`,
              apiKey: 'test-key',
              name: 'Mock Test Gateway',
            },
          },
        };
      },
    };

    // 1. Inicializar la extensión
    gentleImageFlowExtension(mockPi);
    expect(registeredTool).not.toBeNull();
    expect(registeredTool.name).toBe('image_generate');
    expect(registeredCommands.has('gif')).toBe(true);

    // 2. Invocar la herramienta image_generate
    const progressMessages: string[] = [];
    const result = await registeredTool.execute(
      'call-123',
      {
        prompt: 'a cyber kitten',
        model: 'test-dalle',
        filename: 'cyber-kitten',
      },
      undefined,
      (progress: any) => {
        progressMessages.push(progress.content[0].text);
      },
      { cwd: process.cwd() }
    );

    // 3. Validar resultados de tool
    expect(result.content[0].text).toContain('Generated 1 image(s) via Gentle Image Flow');
    expect(result.content[0].text).toContain('cyber-kitten.png');
    expect(result.details.count).toBe(1);

    const savedFile = result.details.images[0];
    expect(savedFile).toContain('cyber-kitten.png');

    // 4. Validar archivo físico en disco
    const fileBytes = await readFile(savedFile);
    expect(fileBytes.length).toBeGreaterThan(0);

    // 5. Validar registro en la galería de sesión
    const galleryItems = SessionGallery.list();
    expect(galleryItems.length).toBeGreaterThan(0);
    expect(galleryItems[0].filename).toContain('cyber-kitten');
    expect(galleryItems[0].prompt).toBe('a cyber kitten');

    // 6. Validar feedback de telemetría de progreso recibido
    expect(progressMessages.length).toBeGreaterThan(0);
  });
});
