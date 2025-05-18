export const vsSource = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aColor;
layout(location = 2) in float aSize;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

out vec3 fragColor;

void main() {
  fragColor = aColor;
  vec4 pos = mView * mWorld * vec4(aPosition, 1.0);
  gl_PointSize = aSize * ( 300.0 / -pos.z );
  gl_Position = mProj * pos;
}
`;

export const fsSource = `#version 300 es
precision highp float;

in vec3 fragColor;
out vec4 outColor;

uniform sampler2D u_pointTexture;

void main() {
  outColor = vec4(fragColor, 1.0) * texture(u_pointTexture, gl_PointCoord);
}
`;

export const IMAGE_SRC = '/src/assets/textures/spark.png';

export const BUFFER_CONFIGS = {
  aPosition: { attrSize: 3 },
  aColor: { attrSize: 3 },
  aSize: { attrSize: 1 },
};

export const PARTICLES_COUNT = 20000;
