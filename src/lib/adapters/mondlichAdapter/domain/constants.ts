import { TCameraProjectionConfig, TCameraViewConfig } from '@/lib/utils/mondlichCamera/domain/types';
import { glMatrix } from 'gl-matrix';

export const DEFAULT_CAMERA_VIEW_CONFIG: TCameraViewConfig = {
  eye: [0, 1500, 1000],
  center: [0, 1100, 0], // lookAt
  up: [0, 1, 0],
};

export const DEFAULT_CAMERA_PROJECTION_CONFIG: TCameraProjectionConfig = {
  fovy: glMatrix.toRadian(100),
  aspect: 1,
  nearPlane: 0.1,
  farPlane: 50000.0,
};
