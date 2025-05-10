export class BaseShaderProgram {
  #program: WebGLProgram | null = null;
  #vertexShader: WebGLShader | null = null;
  #fragmentShader: WebGLShader | null = null;
  #matWorldUniformLocation: WebGLUniformLocation | null = null;
  #matViewUniformLocation: WebGLUniformLocation | null = null;
  #matProjUniformLocation: WebGLUniformLocation | null = null;

  constructor(
    private readonly vertexShaderSource: string,
    private readonly fragmentShaderSource: string,
    readonly glContext: WebGL2RenderingContext,
  ) {
    this.#initShaders();
    this.#compileShaders();
    this.#createProgram();
    this.#initUniformLocations();
  }

  #initShaders = ( ): void => {
    this.#vertexShader = this.glContext.createShader(this.glContext.VERTEX_SHADER);
    this.#fragmentShader = this.glContext.createShader(this.glContext.FRAGMENT_SHADER);
  };

  #compileShaders = (): void => {
    if (!this.#vertexShader) {
      throw new Error('Vertex shader not found');
    }
    if (!this.#fragmentShader) {
      throw new Error('Fragment shader not found');
    }

    this.glContext.shaderSource(this.#vertexShader, this.vertexShaderSource);
    this.glContext.shaderSource(this.#fragmentShader, this.fragmentShaderSource);

    this.glContext.compileShader(this.#vertexShader);
    if (!this.glContext.getShaderParameter(this.#vertexShader, this.glContext.COMPILE_STATUS)) {
      console.error(
        'ERROR compiling vertex shader!',
        this.glContext.getShaderInfoLog(this.#vertexShader),
      );
      return;
    }
    this.glContext.compileShader(this.#fragmentShader);
    if (!this.glContext.getShaderParameter(this.#fragmentShader, this.glContext.COMPILE_STATUS)) {
      console.error(
        'ERROR compiling fragment shader!',
        this.glContext.getShaderInfoLog(this.#fragmentShader),
      );
      return;
    }
  };

  #createProgram = (): void => {
    if (!this.#vertexShader) {
      throw new Error('Vertex shader not found');
    }
    if (!this.#fragmentShader) {
      throw new Error('Fragment shader not found');
    }
    this.#program = this.glContext.createProgram() as WebGLProgram;
    if (!this.#program) {
      throw new Error('Error creating gl program');
    }
    this.glContext.attachShader(this.#program, this.#vertexShader);
    this.glContext.attachShader(this.#program, this.#fragmentShader);
    this.glContext.linkProgram(this.#program);
    if (!this.glContext.getProgramParameter(this.#program, this.glContext.LINK_STATUS)) {
      console.error('ERROR linking program!', this.glContext.getProgramInfoLog(this.#program));
      return;
    }
    this.glContext.validateProgram(this.#program);
    if (!this.glContext.getProgramParameter(this.#program, this.glContext.VALIDATE_STATUS)) {
      console.error('ERROR validating program!', this.glContext.getProgramInfoLog(this.#program));
      return;
    }
  };

  #initUniformLocations = (): void => {
    if (!this.#program) {
      throw new Error('Program not found');
    }

    this.use();

    this.#matWorldUniformLocation = this.glContext.getUniformLocation(this.#program, 'mWorld');
    this.#matViewUniformLocation = this.glContext.getUniformLocation(this.#program, 'mView');
    this.#matProjUniformLocation = this.glContext.getUniformLocation(this.#program, 'mProj');

    if (!this.#matWorldUniformLocation || !this.#matViewUniformLocation || !this.#matProjUniformLocation) {
      throw new Error(`Error while getting matrices uniform location:
      world ${this.#matWorldUniformLocation} |
      view ${this.#matViewUniformLocation} |
      projection ${this.#matProjUniformLocation} |
    `);
    }
  };

  #getUniformLocation = (name: string): WebGLUniformLocation | null => {
    if (!this.#program) throw new Error('Shader program not defined');
    const location = this.glContext.getUniformLocation(this.#program, name);
    if (location === -1) throw new Error(`Uniform '${name}' not defined`);
    return location;
  };

  setMat4 = (name: string, val: Float32Array): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniformMatrix4fv(location, false, val);
  };

  setInteger = (name: string, val: number): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform1i(location, val);
  };

  setFloat = (name: string, val: number): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform1f(location, val);
  };

  setVec2 = (name: string, val: Float32List): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform2fv(location, val);
  };

  setVec3 = (name: string, val: Float32List): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform3fv(location, val);
  };

  setVec4 = (name: string, val: Float32List): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform4fv(location, val);
  };

  setWorldMat = (val: Float32Array): void => {
    if (!this.#matWorldUniformLocation) {
      throw new Error('WorldUniformLocation not found');
    }
    this.glContext.uniformMatrix4fv(this.#matWorldUniformLocation, false, val);
  };

  setViewMat = (val: Float32Array): void => {
    if (!this.#matViewUniformLocation) {
      throw new Error('ViewUniformLocation not found');
    }
    this.glContext.uniformMatrix4fv(this.#matViewUniformLocation, false, val);
  };

  setProjMat = (val: Float32Array): void => {
    if (!this.#matProjUniformLocation) {
      throw new Error('ProjUniformLocation not found');
    }
    this.glContext.uniformMatrix4fv(this.#matProjUniformLocation, false, val);
  };

  get program(): WebGLProgram | null{
    return this.#program;
  }

  use = (): void => {
    this.glContext.useProgram(this.#program);
  };
}
