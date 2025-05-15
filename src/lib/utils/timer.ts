export class Timer {
  private startTime: number;
  private oldTime: number;
  private elapsedTime: number;
  private running: boolean;

  constructor(autoStart: boolean = true) {
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.running = false;

    if (autoStart) this.start();
  }

  start(): void {
    this.startTime = (typeof performance === 'undefined' ? Date : performance).now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  stop(): void {
    this.getElapsedTime();
    this.running = false;
  }

  getElapsedTime(): number {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta(): number {
    let diff = 0;
    const newTime = (typeof performance === 'undefined' ? Date : performance).now();

    if (this.running) {
      diff = (newTime - this.oldTime) / 1000;
      this.elapsedTime += diff;
      this.oldTime = newTime;
    }

    return diff;
  }

  get isRunning (): boolean {
    return this.running;
  }
}
