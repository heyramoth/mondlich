import { WorkerSelectionStrategy } from '../WorkerSelectionStrategy';
import { WorkerWrapper } from '@/lib/core/workerManager/domain/workerWrapper';

export class LeastEffectsStrategy extends WorkerSelectionStrategy {
  private effectCounts: Map<WorkerWrapper, number> = new Map();

  constructor() {
    super();
  }

  init(workers: WorkerWrapper[]) {
    workers.forEach(worker => this.effectCounts.set(worker, 0));
  }

  getLeastBusyWorker(workers: WorkerWrapper[]): WorkerWrapper {
    let minCount = Infinity;
    let leastBusyWorkers: WorkerWrapper[] = [];

    for (const worker of workers) {
      const count = this.effectCounts.get(worker) || 0;
      if (count < minCount) {
        minCount = count;
        leastBusyWorkers = [worker];
      } else if (count === minCount) {
        leastBusyWorkers.push(worker);
      }
    }

    // if all workers have no effects, return any
    if (leastBusyWorkers.length === 0) {
      return workers[0];
    }

    // choose randomly among the least busy
    const index = Math.floor(Math.random() * leastBusyWorkers.length);
    return leastBusyWorkers[index];
  }

  assignEffectToWorker(worker: WorkerWrapper): void {
    const currentCount = this.effectCounts.get(worker) || 0;
    this.effectCounts.set(worker, currentCount + 1);
  }

  removeEffectFromWorker(worker: WorkerWrapper): void {
    const currentCount = this.effectCounts.get(worker) || 0;
    this.effectCounts.set(worker, Math.max(0, currentCount - 1));
  }
}
