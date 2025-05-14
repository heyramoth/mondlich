import { mat4, ReadonlyVec3 } from 'gl-matrix';

type TSetupCameraArguments = {
  viewConfig: {
    eye: ReadonlyVec3,
    center: ReadonlyVec3,
    up: ReadonlyVec3,
  },
  projectionConfig: {
    fovy: number,
    aspect: number,
    nearPlane: number,
    farPlane: number,
  },
};

type TSetupCameraReturnValue = {
  worldMatrix: Float32Array,
  viewMatrix: Float32Array,
  projectionMatrix: Float32Array,
};

const setupCamera = ({
  viewConfig,
  projectionConfig,
}: TSetupCameraArguments): TSetupCameraReturnValue => {
  const worldMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);

  const viewMatrix = new Float32Array(16);
  mat4.lookAt(viewMatrix,
    viewConfig.eye,
    viewConfig.center,
    viewConfig.up,
  );

  const projectionMatrix = new Float32Array(16);
  mat4.perspective(
    projectionMatrix,
    projectionConfig.fovy,
    projectionConfig.aspect,
    projectionConfig.nearPlane,
    projectionConfig.farPlane,
  );

  return {
    worldMatrix,
    viewMatrix,
    projectionMatrix,
  };
};

export { setupCamera };
