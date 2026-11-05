export class AssetOptimizer {
    static sniffFormat(bytes) {
        if (bytes.length < 16) {
            return { mimeType: 'application/octet-stream', extension: 'bin' };
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4e &&
            bytes[3] === 0x47) {
            const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
            const width = view.getUint32(16, false);
            const height = view.getUint32(20, false);
            return { mimeType: 'image/png', extension: 'png', width, height };
        }
        // JPEG: FF D8 FF
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            return { mimeType: 'image/jpeg', extension: 'jpg' };
        }
        // WebP: RIFF ... WEBP
        if (bytes[0] === 0x52 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x46 &&
            bytes[8] === 0x57 &&
            bytes[9] === 0x45 &&
            bytes[10] === 0x42 &&
            bytes[11] === 0x50) {
            return { mimeType: 'image/webp', extension: 'webp' };
        }
        // GIF: GIF87a / GIF89a
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
            return { mimeType: 'image/gif', extension: 'gif' };
        }
        return { mimeType: 'image/png', extension: 'png' };
    }
}
//# sourceMappingURL=optimizer.js.map