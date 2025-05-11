export const vsSource = `#version 300 es
in vec3 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
  gl_Position = vec4(aPosition, 1.0);
  vColor = aColor;
}`;

export const fsSource = `#version 300 es
precision highp float;

in vec3 vColor;
out vec4 fragColor;

void main() {
  fragColor = vec4(vColor, 1.0);
}`;
