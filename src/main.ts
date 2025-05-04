import { ReadonlyVec3 } from 'gl-matrix';
import { glMatrix, mat4 } from 'gl-matrix';

console.log('hello');

const identity = new Float32Array(16);
mat4.identity(identity);

const vec: ReadonlyVec3 = [1, 1, 1];
const zRotationMatrix = new Float32Array(16);
mat4.rotate(zRotationMatrix, identity, Math.PI / 6, [0, 0, 1]);


const fovy = glMatrix.toRadian(45);

const a: number = 6;

const f = (): void => {
  console.log('hello my friend.');
};

f();

const ffsa = 'fasdfasdf';

const test = {
  a: 1,
  b: 2,
  c: 34,
};
