export class WorkerWrapper {
  private worker: Worker;
  private taskCount: number = 0;

  constructor(workerScript: string) {
    this.worker = new Worker(workerScript);
  }

  postMessage(data: unknown): Promise<unknown> {
    this.taskCount++;
    return new Promise((resolve) => {
      this.worker.onmessage = (e) => {
        this.taskCount--;
        resolve(e.data);
      };
      this.worker.postMessage(data);
    });
  }

  get busyness(): number {
    return this.taskCount;
  }
}
