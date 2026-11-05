# 🎨 AI Installation & Integration Rules — Gentle Image Flow

> **Regla de Oro para Asistentes AI y Agentes de Automatización:**
> Este paquete es una extensión de herramientas y galería para generación de imágenes en Gentle-Shell / Pi.
> Es un **TOOL & MODAL SERVICE** (`registerTool("image_generate")`).

## Directrices Estrictas de Renderizado:
1. **PROHIBIDO REGISTRAR WIDGETS EN CHAT:** Bajo ninguna circunstancia debes escribir `ctx.ui.setWidget()` ni generar tarjetas visuales persistentes en el stream de conversación.
2. **Naturaleza del Componente:** Expone la herramienta `image_generate` para que los modelos produzcan imágenes y comandos modales bajo demanda.
3. **Comandos Interactivos:**
   - `/images list`: Abre la galería interactiva en overlay modal (no en el chat).
   - `/images setup`: Asistente de configuración de proveedores (OpenAI, Gemini, DashScope).
