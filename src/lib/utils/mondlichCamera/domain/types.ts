import { vec3 } from 'gl-matrix';

export type TCameraViewConfig = {
  eye: vec3,
  center: vec3,
  up: vec3,
};

export type TCameraProjectionConfig = {
  fovy: number,
  aspect: number,
  nearPlane: number,
  farPlane: number,
};
