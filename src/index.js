(function(window) {
  function Fundus(canvasId, imageUrl, options) {
    var _canvas = document.getElementById(canvasId);
    var _image = new Image();

    var self = this;
    var scale = 1.0;
    var scaleStep = 0.1;

    var events = [];

    function initialize() {
      _image.src = imageUrl;
      _image.onload = imageOnLoad;

      addEventListeners();
    }

    var vs = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying highp vec2 vTextureCoord;
      void main(void) {
        gl_Position = aVertexPosition * uModelViewMatrix;
        vTextureCoord = aTextureCoord;
      }
    `;

    var fs = `
      varying highp vec2 vTextureCoord;
      uniform sampler2D uSampler;
      void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `;

    function imageOnLoad() {
      resize(_image.width / 6, _image.height / 6);
      render(vs, fs);
    }

    function resize(w, h) {
      _canvas.width = w;
      _canvas.height = h;
    }

    function render(vs, fs) {
      var gl = _canvas.getContext('webgl');
      if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
      }

      var program = initShaderProgram(gl, vs, fs);
      var buffers = initBuffers(gl);
      var texture = initTexture(gl);
      draw(gl, program, buffers, texture);
    }

    function initShaderProgram(gl, vSrc, fSrc) {
      var vShader = loadShader(gl, gl.VERTEX_SHADER, vSrc);
      var fShader = loadShader(gl, gl.FRAGMENT_SHADER, fSrc);

      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vShader);
      gl.attachShader(shaderProgram, fShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      return {
        self: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
          textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
          uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
      };
    }

    function loadShader(gl, type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
    
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
    
      return shader;
    }

    function initBuffers(gl) {
      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = [
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
      var textureCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
      const textureCoordinates = [
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
      var indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    
      const indices = [
        0,  1,  2,      
        0,  2,  3,
      ];
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
      return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
      };
    }

    function initTexture(gl) {
      var img = _image;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
    
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);  // reserse Y
    
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, img);

      function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
      }
    
      if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    
      return texture;
    }

    function draw(gl, program, buffers, texture) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      gl.clearDepth(1.0);                 // Clear everything
      gl.enable(gl.DEPTH_TEST);           // Enable depth testing
      gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
      const fieldOfView = 45 * Math.PI / 180;
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = mat4.create();
      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    
      const modelViewMatrix = mat4.create();
      mat4.scale(modelViewMatrix, modelViewMatrix, [scale, scale, scale]);
      mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, 0.0]);
    
      {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(program.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(program.attribLocations.vertexPosition);
      }
    
      {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(program.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(program.attribLocations.textureCoord);
      }
    
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    
      gl.useProgram(program.self);
    
      gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(program.uniformLocations.uSampler, 0);
    
      {
        const vertexCount = 6;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }
    
    }

    function addEventListeners() {
      addEventListener(_canvas, 'mousewheel', onMouseWheel);  // except FireFox
    }

    function addEventListener(eventTarget, eventType, listener){
      eventTarget.addEventListener(eventType, listener);
      events.push({eventTarget: eventTarget, eventType: eventType, listener: listener});
    }

    function onMouseWheel(evt) {
      if (!evt) evt = event;
      evt.preventDefault();
      if(evt.detail < 0 || evt.wheelDelta > 0){ // up -> smaller
        self.zoomOut();
      } else { // down -> larger
        self.zoomIn();
      }
    }

    this.zoomIn = function() {
      scale = scale * (1 + scaleStep);
      render(vs, fs);
    };

    this.zoomOut = function() {
      scale = scale * (1 - scaleStep);
      render(vs, fs);
    };

    initialize();
  }

  window.Fundus = Fundus;
}(window));