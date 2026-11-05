<p align="center">
  <img src="./assets/logo-neon.png" width="450" alt="Gentle Image Flow Logo" style="border-radius: 12px;" />
</p>

<h1 align="center">Gentle Image Flow</h1>

<p align="center">
  <b>Flujo determinista, multiplataforma y observable de generación y edición de imágenes para Gentle-Shell y Pi.</b>
</p>

<p align="center">
  <a href="https://gentlemanprogramming.com/gentle-hub/"><img src="https://img.shields.io/badge/Gentle%20Hub-Extension-F095C8?style=flat-square" alt="Gentle Hub" /></a>
  <a href="https://bit.ly/48zTJUo"><img src="https://img.shields.io/badge/Discord-Apoyo-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord Support" /></a>
  <a href="#instalación"><img src="https://img.shields.io/badge/Pi-Extension-blue?style=flat-square" alt="Pi Extension" /></a>
  <a href="#ecosistema"><img src="https://img.shields.io/badge/Gentle--Shell-Homologado-success?style=flat-square" alt="Gentle-Shell" /></a>
  <a href="#plataformas"><img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blueviolet?style=flat-square" alt="Cross-Platform" /></a>
  <a href="#pruebas"><img src="https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen?style=flat-square" alt="Tests" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache--2.0-yellow?style=flat-square" alt="License" /></a>
</p>

> 💬 **Comunidad y Soporte Oficial:** `wilox2` · [Servidor de Discord](https://bit.ly/48zTJUo)

---

## 📌 ¿Por qué Gentle Image Flow?

Las extensiones tradicionales de generación de imágenes (como `@amaster.ai/pi-image-gen`) sufren de limitaciones críticas que rompen el flujo de trabajo en entornos profesionales:

1. **Prisión de CWD**: Rechazan imágenes fuera de la carpeta actual del proyecto (`cwd`) y bloquean symlinks, imposibilitando usar imágenes compartidas, capturas de pantalla de Windows (`C:\...`) o assets globales.
2. **Modelo rígido**: Bloquean el modelo en un archivo de configuración estático sin permitir overrides puntuales por llamada.
3. **Caja negra sin feedback**: Ejecutan la petición en silencio durante 30 a 45 segundos, creando sensación de congelamiento en la terminal.
4. **Saturación en disco**: Descargan PNGs pesados de 6 MB en una sola carpeta sin clasificar borradores de assets aprobados.
5. **Ambigüedad de roles**: Pasan listas de imágenes sin distinguir si una imagen es una simple referencia de estilo o el objetivo de una edición estructural.

**Gentle Image Flow** resuelve cada uno de estos problemas mediante una arquitectura limpia de ingeniería de software con adaptadores desacoplados, resolución universal de rutas y telemetría de ciclo de vida en tiempo real.

---

## 🚀 Instalación

### Desde el gestor de paquetes de Pi
```bash
pi install npm:@wiloxdev/gentle-image-flow
```

### O en Gentle-Shell
```bash
cd ~/.gentle-shell/agent/extensions
git clone https://github.com/WiloxDev/gentle-image-flow.git
cd gentle-image-flow && npm install && npm run build
```

---

## 🌐 Proveedores y Modelos Soportados

| Proveedor | Modelos de Referencia | Variable de Entorno | Notas |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `nano-banana-pro`, `gemini-3.1-flash-image`, `nano-banana-2` | `GEMINI_API_KEY` | Soporte nativo de `aspectRatio` y tiers `1K/2K/4K`. |
| **OpenAI** | `gpt-image-2.5-flare`, `gpt-image-2`, `dall-e-3` | `OPENAI_API_KEY` | Control de `quality` (`low/medium/high`) y edición multipart. |
| **Alibaba DashScope** | `qwen-image-3.0`, `qwen-image-2.0` | `DASHSCOPE_API_KEY` | Síntesis y edición Qwen con normalización de dimensiones. |
| **ByteDance Seedream** | `doubao-seedream-5-0`, `seedream-5` | `ARK_API_KEY` | Normalización de píxeles (piso de 2K) y omisión automática de `n`. |
| **OpenRouter** | Cualquier slug (ej. `openrouter/bytedance-seed/seedream-4.5`) | `OPENROUTER_API_KEY` | Wire shape dedicado `/api/v1/images`. |
| **Custom / Locales** | Ollama, CLIProxyAPI, vLLM, LocalAI | Clave definida por usuario | Compatible con OpenAPI / OpenAI wire format. |

---

## ⚙️ Configuración Multiplataforma

Los ajustes se declaran bajo la clave `"gentle-image-flow"` en `settings.json` (`~/.gentle-shell/agent/settings.json`, `~/.pi/agent/settings.json` o `<cwd>/.pi/settings.json`):

```json
{
  "gentle-image-flow": {
    "defaultModel": "nano-banana",
    "outputDir": ".pi/images",
    "autoOpen": false,
    "allowedDirectories": [
      "~/Pictures",
      "~/Downloads",
      "~/Desktop"
    ],
    "customProviders": {
      "local-gateway": {
        "api": "openai",
        "baseUrl": "http://127.0.0.1:8317/v1",
        "apiKey": "${LOCAL_GATEWAY_KEY}",
        "name": "Local Gateway Proxy"
      }
    }
  }
}
```

### Raíces Confiables (`allowedDirectories`)
Permite usar imágenes de entrada ubicadas en cualquier carpeta de tu sistema operativo (`~/Pictures`, `~/Downloads`, etc.) o rutas Windows (`C:\Users\...`) de forma segura, evitando tanto el path-traversal como la prisión artificial del proyecto.

---

## 🛠️ Herramienta: `image_generate`

La herramienta central registrada en Pi y Gentle-Shell:

```typescript
image_generate({
  prompt: string,                  // Descripción de la imagen o del retoque
  model?: string,                  // Override dinámico opcional (anula defaultModel en este turno)
  images?: [                       // Imágenes de entrada con roles explícitos
    {
      path: string,                // Ruta local o URL pública
      role: 'style_reference' | 'edit_target' | 'subject_reference'
    }
  ],
  size?: string,                   // ej. "1024x1024", "1920x1080"
  aspectRatio?: string,            // ej. "16:9", "1:1", "9:16", "4:3"
  imageSize?: '1K' | '2K' | '4K',  // Tiers de resolución para modelos compatibles
  quality?: 'low' | 'medium' | 'high' | 'auto',
  n?: number,                      // Cantidad de variantes (1–10)
  filename?: string,               // Prefijo del archivo de salida
  outputDir?: string,              // Override del directorio de salida
  openAfter?: boolean              // Abrir inmediatamente en el visor del sistema operativo
})
```

---

## ⌨️ Comandos Slash

* **`/gif setup`**: Asistente de diagnóstico que auto-detecta las claves presentes en tu entorno, verifica la conectividad con tus proveedores y reporta el estado sin exponer secretos.
* **`/gif list`**: Muestra la tabla de proveedores configurados y el modelo activo.
* **`/gif gallery`**: Abre la galería interactiva de imágenes generadas durante la sesión activa con prompts, timestamps y rutas rápidas para copiar.

---

## 🧪 Pruebas y Control de Calidad

El proyecto cuenta con un 100% de cobertura en pruebas unitarias y E2E:

```bash
npm test
```

Salida:
```text
✓ UniversalPathResolver > formatea URIs para Windows con file:/// conforme a RFC 8089
✓ UniversalPathResolver > normaliza rutas WSL /mnt/c/ a partir de rutas Windows en Linux
✓ AssetOptimizer > detecta correctamente firmas de imagen PNG
✓ AssetOptimizer > detecta correctamente firmas de imagen JPEG
✓ SetupWizard > genera reporte de salud sin exponer valores de claves en texto plano
✓ ejecuta image_generate end-to-end, guarda en staging y registra en galería
```

---

## 📄 Licencia

Licenciado bajo **Apache-2.0**. Desarrollado por **Wilox** y la comunidad de **Gentle-Shell**.
