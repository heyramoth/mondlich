import { ParticleEffect } from '@/lib';
import { WorkerContext } from '@/lib/core/executionContexts/workerContext';
import { WorkerManager } from '@/lib/core/workerManager';
import { ExecutionContext } from '@/lib/core/executionContexts/executionContext';
import { MainThreadContext } from '@/lib/core/executionContexts/mainThreadContext';
import { ParticleSystem } from '@/lib/core/particleSystem';
import { WorkerWrapper } from '@/lib/core/workerManager/domain/workerWrapper';
import { LeastEffectsStrategy } from '@/lib/core/workerManager/domain/WorkerSelectionStrategy/LeastEffectsStrategy';

export class ExecutionContextManager {
  private contexts = new WeakMap<ParticleEffect<any>, ExecutionContext<any>>();
  private workerManager: WorkerManager;

  constructor() {
    this.workerManager = new WorkerManager(new LeastEffectsStrategy());
  }

  setWorkerEnabled<T extends ParticleSystem>(effect: ParticleEffect<T>, enabled: boolean): void {
    const currentContext = this.contexts.get(effect);
    if (enabled) {
      if (currentContext instanceof WorkerContext) {
        return;
      }
      const worker = this.workerManager.getLeastBusyWorker();
      this.workerManager.assignEffectToWorker(worker);
      this.contexts.set(effect, new WorkerContext(worker));
      if (currentContext instanceof MainThreadContext) {
        this.contexts.delete(effect);
      }
    } else {
      if (currentContext instanceof MainThreadContext) {
        return;
      }
      if (currentContext instanceof WorkerContext) {
        this.workerManager.removeEffectFromWorker(currentContext.worker);
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

  groupContexts(
    effects: ParticleEffect<any>[],
  ): Array<Array<[ParticleEffect<any>, ExecutionContext<any>]>> {
    const groups: Array<Array<[ParticleEffect<any>, ExecutionContext<any>]>> = [];
    const workerGroups = new Map<WorkerWrapper, Array<[ParticleEffect<any>, ExecutionContext<any>]>>();

    effects.forEach(( effect) => {
      const context = this.getContext(effect);
      if (context instanceof WorkerContext) {
        const workerWrapper = context.worker;
        if (workerGroups.has(workerWrapper)) {
          workerGroups.get(workerWrapper)?.push([effect, context]);
        } else {
          workerGroups.set(workerWrapper, [[effect, context]]);
        }
        return;
      }
      groups.push([[effect, context]]);
    });
    return [
      ...groups,
      ... Array.from(workerGroups.values()),
    ];
  }

  async update(effects: ParticleEffect<any>[]): Promise<void> {
    const groups = this.groupContexts(effects);
    const updates = groups.map(async (group) => {
      for (const [effect, context] of group) {
        await effect.update(context);
      }
    });
    await Promise.all(updates);
  }
}
