import { ParticleEffect } from '@/lib';
import { WorkerContext } from '@/lib/core/executionContexts/workerContext';
import { WorkerManager } from '@/lib/core/workerManager';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { MainThreadContext } from '@/lib/core/executionContexts/mainThreadContext';

export class ExecutionContextManager {
  private workerContexts = new WeakMap<ParticleEffect<never>, WorkerContext<never>>();

  constructor(private workerManager: WorkerManager) {}

  setWorkerEnabled(
    effect: ParticleEffect<never>,
    enabled: boolean,
  ): void {
    if (enabled) {
      const worker = this.workerManager.getLeastBusyWorker();
      this.workerContexts.set(effect, new WorkerContext(worker));
    } else {
      this.workerContexts.delete(effect);
    }
  }

  getContext(effect: ParticleEffect<never>): ExecutionContext {
    return this.workerContexts.get(effect) || new MainThreadContext();
  }
}
