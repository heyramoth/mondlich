export class MondlichMath {
  /**
   * Generates a random number between minValue (inclusive) and maxValue (exclusive)
   * @param minValue The minimum value (inclusive)
   * @param maxValue The maximum value (exclusive)
   * @returns A random number in the range [minValue, maxValue)
   */
  public static randomInRange(minValue: number, maxValue: number): number {
    return Math.random() * (maxValue - minValue) + minValue;
  }

  // prevents instantiantion
  private constructor() {}
}
