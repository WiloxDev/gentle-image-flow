export class SetupWizard {
    static inspectProviders(settings) {
        const reports = [];
        // 1. Google Gemini
        const geminiKey = process.env.GEMINI_API_KEY || settings.providers?.gemini?.apiKey;
        reports.push({
            id: 'gemini',
            name: 'Google Gemini (Nano Banana)',
            api: 'gemini',
            keySource: process.env.GEMINI_API_KEY ? 'env' : settings.providers?.gemini?.apiKey ? 'settings' : 'missing',
            status: geminiKey ? 'ready' : 'needs_key',
            message: geminiKey ? 'Listo para sintetizar imágenes.' : 'Requiere GEMINI_API_KEY en variables de entorno.',
        });
        // 2. OpenAI
        const openaiKey = process.env.OPENAI_API_KEY || settings.providers?.openai?.apiKey;
        reports.push({
            id: 'openai',
            name: 'OpenAI (GPT-Image / DALL-E)',
            api: 'openai',
            keySource: process.env.OPENAI_API_KEY ? 'env' : settings.providers?.openai?.apiKey ? 'settings' : 'missing',
            status: openaiKey ? 'ready' : 'needs_key',
            message: openaiKey ? 'Listo para sintetizar y editar imágenes.' : 'Requiere OPENAI_API_KEY en variables de entorno.',
        });
        // 3. Alibaba DashScope (Qwen-Image)
        const dashKey = process.env.DASHSCOPE_API_KEY || settings.providers?.dashscope?.apiKey;
        reports.push({
            id: 'dashscope',
            name: 'Alibaba DashScope (Qwen-Image)',
            api: 'dashscope',
            keySource: process.env.DASHSCOPE_API_KEY ? 'env' : settings.providers?.dashscope?.apiKey ? 'settings' : 'missing',
            status: dashKey ? 'ready' : 'needs_key',
            message: dashKey ? 'Listo para síntesis y edición Qwen.' : 'Requiere DASHSCOPE_API_KEY en variables de entorno.',
        });
        // 4. Custom Providers declarados
        if (settings.customProviders) {
            for (const [id, custom] of Object.entries(settings.customProviders)) {
                const hasKey = Boolean(custom.apiKey || custom.apiKey?.startsWith('$'));
                reports.push({
                    id,
                    name: custom.name || id,
                    api: custom.api,
                    keySource: hasKey ? 'settings' : 'missing',
                    status: hasKey ? 'ready' : 'needs_key',
                    message: `Endpoint configurado en ${custom.baseUrl}`,
                });
            }
        }
        return reports;
    }
    static formatReportText(reports, defaultModel) {
        const lines = [];
        lines.push('╔══════════════════════════════════════════════════════════════════════╗');
        lines.push('║             GENTLE IMAGE FLOW - DIAGNÓSTICO DE PROVEEDORES           ║');
        lines.push('╚══════════════════════════════════════════════════════════════════════╝');
        lines.push(`Modelo activo por defecto: ${defaultModel || '(no configurado - usa "nano-banana" o "sdxl")'}\n`);
        for (const r of reports) {
            const icon = r.status === 'ready' ? '✔' : '⚠';
            lines.push(`${icon} [${r.id}] ${r.name}`);
            lines.push(`   API: ${r.api} | Origen clave: ${r.keySource}`);
            lines.push(`   Detalle: ${r.message}\n`);
        }
        lines.push('Para usar un proveedor, asegúrate de exportar su clave o configurarlo en settings.json.');
        lines.push('Ejemplo: export GEMINI_API_KEY="tu-clave"');
        return lines.join('\n');
    }
}
//# sourceMappingURL=setup.js.map