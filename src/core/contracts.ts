import { Type, type Static } from 'typebox';

export const ImageRoleSchema = Type.Union([
  Type.Literal('style_reference'),
  Type.Literal('edit_target'),
  Type.Literal('subject_reference'),
], {
  description: 'Rol de la imagen de entrada: style_reference (copiar estilo/paleta), edit_target (imagen base a retocar) o subject_reference (preservar sujeto/personaje).',
});

export const ImageInputSchema = Type.Object({
  path: Type.String({
    description: 'Ruta local absoluta, relativa a cwd o ruta permitida (ej. ~/Pictures, ~/Downloads) o URL http(s) pública.',
  }),
  role: Type.Optional(ImageRoleSchema),
});

export const ImageGenerateToolSchema = Type.Object({
  prompt: Type.String({
    description: 'Instrucción o descripción de la imagen a generar o editar.',
  }),
  model: Type.Optional(Type.String({
    description: 'Identificador del modelo a utilizar (anula temporalmente defaultModel de settings.json para esta llamada).',
  })),
  images: Type.Optional(Type.Array(ImageInputSchema, {
    description: 'Imágenes de referencia o de edición con especificación explícita de su rol.',
  })),
  size: Type.Optional(Type.String({
    description: 'Dimensiones deseadas en píxeles (ej. "1024x1024", "1920x1080" o "2048*2048"). Se normaliza automáticamente al formato del proveedor.',
  })),
  aspectRatio: Type.Optional(Type.String({
    description: 'Relación de aspecto (ej. "1:1", "16:9", "9:16", "4:3", "3:4"). Utilizado directamente por Gemini o convertido para otros proveedores.',
  })),
  imageSize: Type.Optional(Type.Union([
    Type.Literal('1K'),
    Type.Literal('2K'),
    Type.Literal('4K'),
  ], {
    description: 'Nivel de resolución/tier para modelos que lo soportan (Gemini, Seedream).',
  })),
  quality: Type.Optional(Type.Union([
    Type.Literal('low'),
    Type.Literal('medium'),
    Type.Literal('high'),
    Type.Literal('auto'),
  ], {
    description: 'Calidad del renderizado (aplicable a OpenAI gpt-image).',
  })),
  n: Type.Optional(Type.Integer({
    minimum: 1,
    maximum: 10,
    description: 'Cantidad de variantes a generar (omitido automáticamente para APIs que no soportan múltiples variantes en una llamada).',
  })),
  filename: Type.Optional(Type.String({
    description: 'Nombre base del archivo de salida sin extensión.',
  })),
  outputDir: Type.Optional(Type.String({
    description: 'Directorio de salida personalizado (por defecto: .pi/images/staging).',
  })),
  openAfter: Type.Optional(Type.Boolean({
    description: 'Abrir inmediatamente la imagen generada en el visor predeterminado del sistema operativo.',
  })),
});

export type ImageGenerateToolParams = Static<typeof ImageGenerateToolSchema>;
