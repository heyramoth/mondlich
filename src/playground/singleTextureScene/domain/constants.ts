export const vsSource = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPosition;

uniform mat4 mCamera;

void main() {
  gl_Position = mCamera * vec4(aPosition, 1.0);
  gl_PointSize = 16.0;
}
`;

export const fsSource = `#version 300 es
precision highp float;

uniform sampler2D u_pointTexture;

out vec4 outColor;

void main() {
  outColor = texture(u_pointTexture, gl_PointCoord);
}
`;
