import { WorkerWrapper } from './domain/workerWrapper';
import workerUrl from '@/lib/core/workerManager/domain/particle.worker.js?worker&url';
import { WorkerSelectionStrategy } from './domain/WorkerSelectionStrategy/WorkerSelectionStrategy';

const DEFAULT_POOL_SIZE = Math.floor(navigator.hardwareConcurrency * 0.5) || 1;

export class WorkerManager {
  private strategy: WorkerSelectionStrategy;
  private workers: WorkerWrapper[] = [];

  constructor(strategy: WorkerSelectionStrategy, poolSize: number = DEFAULT_POOL_SIZE) {
    this.strategy = strategy;
    const resolvedWorkerUrl = new URL(workerUrl, import.meta.url);
    this.workers = Array.from(
      { length: poolSize },
      () => new WorkerWrapper(resolvedWorkerUrl),
    );
    this.strategy.init(this.workers);
  }

  setStrategy(strategy: WorkerSelectionStrategy) {
    this.strategy = strategy;
    this.strategy.init(this.workers);
  }

  getLeastBusyWorker(): WorkerWrapper {
    return this.strategy.getLeastBusyWorker(this.workers);
  }

  assignEffectToWorker(worker: WorkerWrapper): void {
    this.strategy.assignEffectToWorker(worker);
  }

  removeEffectFromWorker(worker: WorkerWrapper): void {
    this.strategy.removeEffectFromWorker(worker);
  }
}
