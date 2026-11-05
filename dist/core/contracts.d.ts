import { Type, type Static } from 'typebox';
export declare const ImageRoleSchema: Type.TUnion<[Type.TLiteral<"style_reference">, Type.TLiteral<"edit_target">, Type.TLiteral<"subject_reference">]>;
export declare const ImageInputSchema: Type.TObject<{
    path: Type.TString;
    role: Type.TOptional<Type.TUnion<[Type.TLiteral<"style_reference">, Type.TLiteral<"edit_target">, Type.TLiteral<"subject_reference">]>>;
}>;
export declare const ImageGenerateToolSchema: Type.TObject<{
    prompt: Type.TString;
    model: Type.TOptional<Type.TString>;
    images: Type.TOptional<Type.TArray<Type.TObject<{
        path: Type.TString;
        role: Type.TOptional<Type.TUnion<[Type.TLiteral<"style_reference">, Type.TLiteral<"edit_target">, Type.TLiteral<"subject_reference">]>>;
    }>>>;
    size: Type.TOptional<Type.TString>;
    aspectRatio: Type.TOptional<Type.TString>;
    imageSize: Type.TOptional<Type.TUnion<[Type.TLiteral<"1K">, Type.TLiteral<"2K">, Type.TLiteral<"4K">]>>;
    quality: Type.TOptional<Type.TUnion<[Type.TLiteral<"low">, Type.TLiteral<"medium">, Type.TLiteral<"high">, Type.TLiteral<"auto">]>>;
    n: Type.TOptional<Type.TInteger>;
    filename: Type.TOptional<Type.TString>;
    outputDir: Type.TOptional<Type.TString>;
    openAfter: Type.TOptional<Type.TBoolean>;
}>;
export type ImageGenerateToolParams = Static<typeof ImageGenerateToolSchema>;
//# sourceMappingURL=contracts.d.ts.map