export class Timer {
  #prevTick: number = 0;
  #delta: number = 0;

  get delta (): number {
    return this.#delta;
  }
  get time (): number {
    return this.#prevTick;
  }
  init = (): void => {
    this.#prevTick = performance.now();
  };

  updateDelta = (): void => {
    const curTick = performance.now();
    this.#delta = curTick - this.#prevTick;
    this.#prevTick = curTick;
  };
}
