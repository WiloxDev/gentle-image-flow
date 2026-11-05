import type { ExecutionLifecycleState, LifecycleProgress } from '../types.js';
export type OnProgressCallback = (progress: LifecycleProgress) => void;
export declare class LifecycleManager {
    private state;
    private startTime;
    private timer;
    private readonly model;
    private readonly provider;
    private readonly onProgress?;
    constructor(model: string, provider: string, onProgress?: OnProgressCallback);
    start(): void;
    transition(state: ExecutionLifecycleState, message?: string): void;
    private emit;
    cleanup(): void;
}
//# sourceMappingURL=lifecycle.d.ts.map