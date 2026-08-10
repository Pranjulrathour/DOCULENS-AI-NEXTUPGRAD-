import type { ProcessingStage } from "@/types/analysis";

export class StageTimer {
  private stages: ProcessingStage[] = [];
  private readonly startedAt = Date.now();

  async run<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    const result = await fn();
    this.stages.push({ name, durationMs: Date.now() - start });
    return result;
  }

  finish() {
    return { durationMs: Date.now() - this.startedAt, stages: this.stages };
  }
}
