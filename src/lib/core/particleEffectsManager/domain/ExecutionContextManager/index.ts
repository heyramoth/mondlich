import { ParticleEffect } from '@/lib';
import { WorkerContext } from '@/lib/core/executionContexts/workerContext';
import { WorkerManager } from '@/lib/core/workerManager';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { MainThreadContext } from '@/lib/core/executionContexts/mainThreadContext';

export class ExecutionContextManager {
  private contexts = new WeakMap<ParticleEffect<never>, ExecutionContext<never>>();
  private workerManager: WorkerManager;

  constructor() {
    this.workerManager = new WorkerManager();
  }

  setWorkerEnabled(
    effect: ParticleEffect<never>,
    enabled: boolean,
  ): void {
    if (enabled) {
      const worker = this.workerManager.getLeastBusyWorker();
      this.contexts.set(effect, new WorkerContext(worker));
    } else {
      this.contexts.set(effect, new MainThreadContext());
    }
  }

  getContext(effect: ParticleEffect<never>): ExecutionContext {
    return this.contexts.get(effect) || new MainThreadContext();
  }
}
