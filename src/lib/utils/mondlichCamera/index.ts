import {
  mat4,
  ReadonlyVec3,
  vec3,
} from 'gl-matrix';
import {
  TCameraViewConfig,
  TCameraProjectionConfig,
} from './domain/types';

export class MondlichCamera {
  private _viewConfig: TCameraViewConfig;
  private _projectionConfig: TCameraProjectionConfig;
  private _worldMatrix: Float32Array;
  private _viewMatrix: Float32Array;
  private _projectionMatrix: Float32Array;

  constructor({ viewConfig, projectionConfig }: {
    viewConfig: TCameraViewConfig,
    projectionConfig: TCameraProjectionConfig,
  }) {
    this._viewConfig = {
      eye: vec3.clone(viewConfig.eye),
      center: vec3.clone(viewConfig.center),
      up: vec3.clone(viewConfig.up),
    };
    this._projectionConfig = { ...projectionConfig };

    this._worldMatrix = new Float32Array(16);
    this._viewMatrix = new Float32Array(16);
    this._projectionMatrix = new Float32Array(16);

    this.updateMatrices();
  }

  private updateMatrices(): void {
    mat4.identity(this._worldMatrix);
    mat4.lookAt(
      this._viewMatrix,
      this._viewConfig.eye,
      this._viewConfig.center,
      this._viewConfig.up,
    );
    mat4.perspective(
      this._projectionMatrix,
      this._projectionConfig.fovy,
      this._projectionConfig.aspect,
      this._projectionConfig.nearPlane,
      this._projectionConfig.farPlane,
    );
  }

  setEyePosition(eye: ReadonlyVec3): void {
    vec3.copy(this._viewConfig.eye, eye);
    this.updateMatrices();
  }

  setLookAt(center: ReadonlyVec3): void {
    vec3.copy(this._viewConfig.center, center);
    this.updateMatrices();
  }

  setUpVector(up: ReadonlyVec3): void {
    vec3.copy(this._viewConfig.up, up);
    this.updateMatrices();
  }

  moveEye(delta: ReadonlyVec3): void {
    vec3.add(this._viewConfig.eye, this._viewConfig.eye, delta);
    this.updateMatrices();
  }

  moveLookAt(delta: ReadonlyVec3): void {
    vec3.add(this._viewConfig.center, this._viewConfig.center, delta);
    this.updateMatrices();
  }

  // Projection controls
  setFovy(fovy: number): void {
    this._projectionConfig.fovy = fovy;
    this.updateMatrices();
  }

  setAspect(aspect: number): void {
    this._projectionConfig.aspect = aspect;
    this.updateMatrices();
  }

  setNearPlane(near: number): void {
    this._projectionConfig.nearPlane = near;
    this.updateMatrices();
  }

  setFarPlane(far: number): void {
    this._projectionConfig.farPlane = far;
    this.updateMatrices();
  }

  get worldMatrix(): Float32Array {
    return this._worldMatrix;
  }

  get viewMatrix(): Float32Array {
    return this._viewMatrix;
  }

  get projectionMatrix(): Float32Array {
    return this._projectionMatrix;
  }

  get eyePosition(): ReadonlyVec3 {
    return this._viewConfig.eye;
  }

  get lookAtPoint(): ReadonlyVec3 {
    return this._viewConfig.center;
  }

  get upVector(): ReadonlyVec3 {
    return this._viewConfig.up;
  }
}
