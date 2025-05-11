export class BaseShaderProgram {
  #program: WebGLProgram | null = null;
  #vertexShader: WebGLShader | null = null;
  #fragmentShader: WebGLShader | null = null;
  #uniformLocations: Map<PropertyKey, WebGLUniformLocation> = new Map();

  constructor(
    private readonly vertexShaderSource: string,
    private readonly fragmentShaderSource: string,
    readonly glContext: WebGL2RenderingContext,
  ) {
    this.#initShaders();
    this.#compileShaders();
    this.#createProgram();
    this.#cacheUniformLocations();
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

  #cacheUniformLocations = (): void => {
    if (!this.#program) {
      throw new Error('Program not found');
    }

    this.use();

    // total number of active uniforms
    const numUniforms = this.glContext.getProgramParameter(
      this.#program,
      this.glContext.ACTIVE_UNIFORMS,
    );

    // query and cache all uniform locations
    for (let i = 0; i < numUniforms; i++) {
      const uniformInfo: WebGLActiveInfo | null = this.glContext.getActiveUniform(this.#program, i);
      if (!uniformInfo) continue;

      const location: WebGLUniformLocation | null = this.glContext.getUniformLocation(
        this.#program,
        uniformInfo.name,
      );

      if (location) {
        // for array uniforms. "myArray[0]" becomes "myArray"
        const uniformName = uniformInfo.name.replace(/\[.*?\]/, '');
        this.#uniformLocations.set(uniformName, location);
      }
    }
  };

  #getUniformLocation = (name: string): WebGLUniformLocation | null => {
    if (!this.#program) throw new Error('Shader program not defined');

    const cachedLocation = this.#uniformLocations.get(name);
    if (cachedLocation) return cachedLocation;

    const location: WebGLUniformLocation | null = this.glContext.getUniformLocation(this.#program, name);
    if (location === -1 || location === null) throw new Error(`Uniform '${name}' not found or optimized out`);

    this.#uniformLocations.set(name, location);
    return location;
  };

  setMat4 = (name: string, val: Float32Array): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniformMatrix4fv(location, false, val);
  };

  setMat3 = (name: string, value: Float32Array): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniformMatrix3fv(location, false, value);
  };

  setMat2 = (name: string, value: Float32Array): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniformMatrix2fv(location, false, value);
  };

  setInt = (name: string, value: number): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform1i(location, value);
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

  setIntArray = (name: string, value: Int32Array): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform1iv(location, value);
  };

  setFloatArray = (name: string, value: Float32Array): void => {
    const location = this.#getUniformLocation(name);
    this.glContext.uniform1fv(location, value);
  };

  get program(): WebGLProgram | null{
    return this.#program;
  }

  use = (): void => {
    this.glContext.useProgram(this.#program);
  };

  cleanup = (): void => {
    if (this.#program) {
      this.glContext.deleteProgram(this.#program);
      this.#program = null;
    }
    this.#uniformLocations.clear();
  };
}
