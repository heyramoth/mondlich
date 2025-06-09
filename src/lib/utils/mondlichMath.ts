import {
  mat4, quat, vec2, vec3,
} from 'gl-matrix';

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

  /**
   * Rotates a 3D point around a specified axis.
   *
   * @param point - The point to rotate as vec3 [x, y, z]
   * @param axisOrigin - Origin point of the rotation axis as vec3 [x, y, z]
   * @param axisDirection - Direction vector of the rotation axis as vec3 [x, y, z] (will be normalized)
   * @param rotationAngle - Rotation angle in radians
   * @returns The rotated point as vec3 [x, y, z]
   */
  public static rotatePointAroundAxis({
    point, axisOrigin, axisDirection, rotationAngle,
  }: {
    point: vec3,
    axisOrigin: vec3,
    axisDirection: vec3,
    rotationAngle: number,
  }): vec3 {
    const rotationQuat = quat.create(); // represents rotation around the axis
    quat.setAxisAngle(rotationQuat, axisDirection, rotationAngle);

    const transformationMat = mat4.create();

    // translate to origin, rotate, then translate back
    mat4.translate(transformationMat, transformationMat, [-axisOrigin[0], -axisOrigin[1], -axisOrigin[2]]);
    mat4.fromRotationTranslation(transformationMat, rotationQuat, [0, 0, 0]);
    mat4.translate(transformationMat, transformationMat, axisOrigin);

    const rotatedPoint = vec3.create();
    vec3.transformMat4(rotatedPoint, point, transformationMat);

    return rotatedPoint;
  }

  public static randomPointOnCircle(radius: number): vec2 {
    const theta = Math.random() * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    return vec2.fromValues(x, y);
  }

  public static lerp(first: number, second: number, t: number): number {
    return first + t * (second - first);
  }

  // prevents instantiantion
  private constructor() {}
}
