import { BaseShaderProgram, RenderData } from '@/lib/render';

const vsSource = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

out vec3 vColor;

void main() {
  vColor = aColor;
  gl_Position = mProj * mView * mWorld * vec4(aPosition, 1.0);
}`;

const fsSource = `#version 300 es
precision highp float;

in vec3 vColor;
out vec4 fragColor;

void main() {
  fragColor = vec4(vColor, 1.0);
}`;


export const createXZPlane = (gl: WebGL2RenderingContext): {
  planeRenderData: RenderData,
  planeShader: BaseShaderProgram,
} => {

  const planeShader = new BaseShaderProgram(vsSource, fsSource, gl);

  const size = 10000;
  const halfSize = size / 2;

  const positions = new Float32Array([
    -halfSize, 0, -halfSize,
    halfSize, 0, -halfSize,
    halfSize, 0, halfSize,
    -halfSize, 0, halfSize,
  ]);

  const colors = new Float32Array([
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
  ]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const planeRenderData = new RenderData({
    gl,
    shaderProgram: planeShader,
    elementsCount: 4,
  });

  planeRenderData.createIndexBuffer({ data: indices });

  planeRenderData.createVertexBuffer({
    name: 'aPosition',
    data: positions,
    attributeConfig: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 3 * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
  });

  planeRenderData.createVertexBuffer({
    name: 'aColor',
    data: colors,
    attributeConfig: {
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 3 * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
  });



  return {
    planeRenderData,
    planeShader,
  };
};
