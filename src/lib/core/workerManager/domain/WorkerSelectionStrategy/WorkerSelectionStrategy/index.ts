import { WorkerWrapper } from '@/lib/core/workerManager/domain/workerWrapper';

export abstract class WorkerSelectionStrategy {
  abstract init(workers: WorkerWrapper[]): void;
  abstract getLeastBusyWorker(workers: WorkerWrapper[]): WorkerWrapper;
  abstract assignEffectToWorker(worker: WorkerWrapper): void;
  abstract removeEffectFromWorker(worker: WorkerWrapper): void;
}
