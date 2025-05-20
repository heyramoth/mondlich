import { WorkerWrapper } from './domain/workerWrapper';

export class WorkerManager {
  private workers: WorkerWrapper[] = [];
  private workerScriptUrl: URL;
  private poolSize = Math.floor(navigator.hardwareConcurrency * 0.5) || 1;

  // TODO: заменить на this.poolSize
  constructor(poolSize: number = 1) {
    this.workerScriptUrl = new URL('./domain/particle.worker.js', import.meta.url);
    this.workers = Array.from(
      { length: poolSize }, () => new WorkerWrapper(this.workerScriptUrl),
    );
  }

  getLeastBusyWorker(): WorkerWrapper {
    return this.workers.reduce((prev, current) =>
      prev.busyness < current.busyness ? prev : current,
    );
  }
}
