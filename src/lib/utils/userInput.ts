import { vec3 } from 'gl-matrix';
import { MondlichCamera } from '@/lib/utils/mondlichCamera';
import { Timer } from '@/lib/utils/timer';


export class UserInput {
  private camera: MondlichCamera;
  private timer: Timer;
  private sensitivity: number;
  private isDragging: boolean;
  private lastX: number;
  private lastY: number;

  private moveSpeed: number;
  private rotateSpeed: number;
  private keys: Record<string, boolean>;

  constructor({
    camera,
    sensitivity = 1.0,
    moveSpeed = 100.0,
    rotateSpeed = 2.0,
  }: {
    camera: MondlichCamera,
    sensitivity?: number,
    moveSpeed?: number,
    rotateSpeed?: number,
  }) {
    this.camera = camera;
    this.timer = new Timer();
    this.sensitivity = sensitivity;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.moveSpeed = moveSpeed;
    this.rotateSpeed = rotateSpeed;
    this.keys = {
      'w': false,
      'a': false,
      's': false,
      'd': false,
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;

    const moveX = dx * this.sensitivity;
    const moveY = dy * this.sensitivity;

    const currentLookAt = vec3.clone(this.camera.lookAtPoint);
    vec3.add(currentLookAt, currentLookAt, [moveX, -moveY, 0]);
    this.camera.setLookAt(currentLookAt);

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  private onMouseUp(): void {
    this.isDragging = false;
  }

  update(): void {
    const deltaTime = this.timer.getDelta();
    this.handleKeyboardInput(deltaTime);
  }

  private handleKeyboardInput(deltaTime: number): void {
    // calculate front direction (from eye to look-at point)
    const front = vec3.create();
    vec3.subtract(front, this.camera.lookAtPoint, this.camera.eyePosition);
    vec3.normalize(front, front);

    // calculate right direction (cross product of front and up)
    const right = vec3.create();
    vec3.cross(right, front, this.camera.upVector);
    vec3.normalize(right, right);

    if (this.keys['w']) {
      const move = vec3.scale(vec3.create(), front, this.moveSpeed * deltaTime);
      this.camera.moveEye(move);
      this.camera.moveLookAt(move);
    }
    if (this.keys['s']) {
      const move = vec3.scale(vec3.create(), front, -this.moveSpeed * deltaTime);
      this.camera.moveEye(move);
      this.camera.moveLookAt(move);
    }
    if (this.keys['a']) {
      this.rotateCamera(-this.rotateSpeed * deltaTime);
    }
    if (this.keys['d']) {
      this.rotateCamera(this.rotateSpeed * deltaTime);
    }
  }

  private rotateCamera(angle: number): void {
    const eye = vec3.clone(this.camera.eyePosition);
    const center = vec3.clone(this.camera.lookAtPoint);
    const up = vec3.clone(this.camera.upVector);

    // normalize the rotation axis (camera's up vector)
    const axis = vec3.create();
    vec3.normalize(axis, up);

    // vector from center to eye
    const toEye = vec3.create();
    vec3.subtract(toEye, eye, center);

    // apply rodrigues' rotation formula
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // term1: v * cos
    const term1 = vec3.create();
    vec3.scale(term1, toEye, cos);

    // term2: (k × v) * sin
    const cross = vec3.create();
    vec3.cross(cross, axis, toEye);
    const term2 = vec3.create();
    vec3.scale(term2, cross, sin);

    // term3: k * (k · v) * (1 - cos)
    const dot = vec3.dot(axis, toEye);
    const term3 = vec3.create();
    vec3.scale(term3, axis, dot * (1 - cos));

    const rotated = vec3.create();
    vec3.add(rotated, term1, term2);
    vec3.add(rotated, rotated, term3);

    // add back center position
    vec3.add(rotated, rotated, center);

    this.camera.setEyePosition(rotated);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (key in this.keys) {
      this.keys[key] = true;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (key in this.keys) {
      this.keys[key] = false;
    }
  }

  dispose(): void {
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }
}
