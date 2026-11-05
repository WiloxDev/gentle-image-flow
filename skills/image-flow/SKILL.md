---
name: image-flow
description: "Prompting and execution workflow for image_generate from Gentle Image Flow. Use when synthesizing or editing raster images (concept art, photorealism, textures, mockups, marketing assets, sprites) or when editing existing images. Directs vector/SVG/CSS tasks to native source code."
---

# Gentle Image Flow — Agent Skill

Esta skill guía el uso de la herramienta `image_generate` provista por `@wiloxdev/gentle-image-flow`.

---

## 1. Cuándo USAR y cuándo NO USAR

### Cuándo USAR `image_generate`:
- Generación de assets ráster nuevos: fotografías, concept art, texturas realistas, fondos, renders 3D, ilustraciones complejas o sprites.
- Edición o variación de una imagen existente (img2img, inpainting, cambio de iluminación, retoque de fondo o preservación de personaje).
- Composición guiada por múltiples imágenes con roles definidos.

### Cuándo NO USAR:
- **Iconos, logotipos simples o diagramas**: Si el proyecto utiliza SVG, Lucide, FontAwesome o HTML/Canvas, escribe o edita el código fuente directamente. No uses generación de mapas de bits cuando se espera código vectorial determinista.
- **Wireframes o componentes UI simples**: Prefiere componentes HTML/Tailwind/CSS editables.

---

## 2. Los Tres Roles de Imágenes de Entrada (`ImageIntent`)

A diferencia de herramientas genéricas, `image_generate` exige clasificar el rol de cada imagen de entrada en `images`:

1. **`style_reference`**:
   * *Propósito*: Copiar únicamente la paleta cromática, iluminación, técnica artística o atmósfera general.
   * *Comportamiento*: El modelo NO preserva la geometría ni los sujetos de la imagen; solo absorbe la estética.
2. **`edit_target`**:
   * *Propósito*: La imagen base que debe ser modificada o retocada.
   * *Comportamiento*: Se preserva la estructura espacial y los elementos no mencionados en el cambio.
   * *Regla*: En el prompt, debes declarar explícitamente los **invariantes**: *"Modifica únicamente el fondo; conserva intacto el sujeto en primer plano"*.
3. **`subject_reference`**:
   * *Propósito*: Mantener la consistencia facial, de vestimenta o de producto en una nueva escena.
   * *Comportamiento*: Reubica al sujeto en un entorno completamente nuevo.

---

## 3. Estructura Óptima del Prompt

Organiza el prompt de forma jerárquica y directa. Para prompts complejos, utiliza etiquetas concisas:

```text
Caso de uso: <fotografía de producto / ilustración / concept-art / banner web>
Sujeto principal: <descripción detallada del sujeto>
Entorno y fondo: <escenario, profundidad de campo, atmósfera>
Estilo y técnica: <fotografía 35mm, render Octane, acuarela, anime retro, etc.>
Iluminación: <luz natural cenital, neón volumétrico, iluminación de estudio suave>
Paleta de color: <tonos cálidos, monocromático, ciberpunk cian y magenta>
Composición: <plano medio, regla de tercios, vista en picado, espacio negativo para texto>
Restricciones negativas: <evitar distorsión, sin texto borroso, sin artefactos>
```

---

## 4. Texto Dentro de Imágenes

Si la imagen debe contener texto legible:
* Coloca el texto literal siempre entre comillas dobles: `"Gentle Flow"`.
* Especifica tipografía y ubicación: *"con tipografía sans-serif bold, en color blanco centrado en la parte superior"*.
* Deletrea palabras poco comunes letra por letra si la precisión es crítica.
* Para modelos OpenAI (`gpt-image`), solicita `quality: "high"` si el texto requiere alta nitidez.

---

## 5. Reporte de Resultados y Buenas Prácticas

* La herramienta devuelve una ruta absoluta y un enlace Markdown conforme al estándar multiplataforma (`file:///...` en Windows, rutas POSIX en Linux/macOS).
* **Renderiza siempre la imagen inline** en tu respuesta para que el usuario pueda verla en su cliente o terminal:
  ```markdown
  ![nombre-de-la-imagen](ruta-devuelta.png)
  ```
* Si el usuario te pide iterar sobre una imagen previa, toma la ruta devuelta en la respuesta anterior y pásala en `images` con `role: "edit_target"`.
