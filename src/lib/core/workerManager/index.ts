import { WorkerWrapper } from './domain/workerWrapper';

export class WorkerManager {
  private workers: WorkerWrapper[] = [];
  private workerScript: string;

  constructor(workerScript: string, poolSize: number = navigator.hardwareConcurrency || 4) {
    this.workerScript = workerScript;
    this.workers = Array.from({ length: poolSize }, () => new WorkerWrapper(workerScript));
  }

  getLeastBusyWorker(): WorkerWrapper {
    return this.workers.reduce((prev, current) =>
      prev.busyness < current.busyness ? prev : current,
    );
  }
}
