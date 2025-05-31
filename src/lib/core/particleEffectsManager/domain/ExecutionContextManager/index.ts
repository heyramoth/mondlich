import { ParticleEffect } from '@/lib';
import { WorkerContext } from '@/lib/core/executionContexts/workerContext';
import { WorkerManager } from '@/lib/core/workerManager';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { MainThreadContext } from '@/lib/core/executionContexts/mainThreadContext';
import { ParticleSystem } from '@/lib/core/particleSystem';

export class ExecutionContextManager {
  private contexts = new WeakMap<ParticleEffect<any>, ExecutionContext<any>>();
  private workerManager: WorkerManager;

  constructor() {
    this.workerManager = new WorkerManager();
  }

  setWorkerEnabled<T extends ParticleSystem>(effect: ParticleEffect<T>, enabled: boolean): void {
    if (enabled) {
      if (this.contexts.get(effect) instanceof WorkerContext) {
        return;
      }
      const worker = this.workerManager.getLeastBusyWorker();
      this.contexts.set(effect, new WorkerContext(worker));
    } else {
      const currentContext = this.contexts.get(effect);
      if (currentContext instanceof WorkerContext) {
        this.terminateContext(effect);
      }
      this.contexts.set(effect, new MainThreadContext());
    }
  }

  terminateContext<T extends ParticleSystem>(effect: ParticleEffect<T>): void {
    const context = this.getContext(effect);
    if (context instanceof WorkerContext) {
      context.terminate();
    }
  }

  getContext<T extends ParticleSystem>(effect: ParticleEffect<T>): ExecutionContext<T> {
    return (this.contexts.get(effect) || new MainThreadContext()) as ExecutionContext<T>;
  }
}
