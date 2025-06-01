type TWorkerReturnValue = {
  positions: Float32Array,
  sizes: Float32Array,
  velocities: Float32Array,
  masses: Float32Array,
  decays: Float32Array,
  lives: Float32Array,
  gravities: Float32Array,
  aliveStatus: Uint8Array,
};

const logWorkerError = (event: ErrorEvent) => {
  console.error('Worker error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  });
};

export class WorkerWrapper {
  private worker: Worker;
  private taskCount: number = 0;

  constructor(workerUrl: URL) {
    this.worker = new Worker(workerUrl, { type: 'module' });
    this.worker.onerror = logWorkerError;
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

  terminate() {
    this.worker.terminate();
  }
}
