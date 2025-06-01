import { WorkerWrapper } from './domain/workerWrapper';
import workerUrl from '@/lib/core/workerManager/domain/particle.worker.js?worker&url';

export class WorkerManager {
  private workers: WorkerWrapper[] = [];
  private poolSize = Math.floor(navigator.hardwareConcurrency * 0.5) || 1;

  // TODO: заменить на this.poolSize
  constructor(poolSize: number = 4) {
    const resolvedWorkerUrl = new URL(workerUrl, import.meta.url);
    this.workers = Array.from(
      { length: poolSize }, () => new WorkerWrapper(resolvedWorkerUrl),
    );
  }

  getLeastBusyWorker(): WorkerWrapper {
    return this.workers[Math.floor(Math.random() * this.workers.length)];
  }
}
