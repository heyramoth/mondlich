type TWorkerReturnValue = {
  positions: Float32Array,
  sizes: Float32Array,
  velocities: Float32Array,
  masses: Float32Array,
  decays: Float32Array,
  lives: Float32Array,
};

export class WorkerWrapper {
  private worker: Worker;
  private taskCount: number = 0;

  constructor(workerScript: URL) {
    this.worker = new Worker(workerScript, { type: 'module' });
  }

  postMessage(data: unknown, transfer: Transferable[] = []): Promise<TWorkerReturnValue> {
    this.taskCount++;
    return new Promise((resolve) => {
      this.worker.onmessage = (e) => {
        this.taskCount--;
        resolve(e.data);
      };
      this.worker.postMessage(data, transfer);
    });
  }

  get busyness(): number {
    return this.taskCount;
  }
}
