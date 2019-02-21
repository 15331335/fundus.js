(function(window) {
  function Fundus(canvasId, imageUrl, options) {
    var canvas = document.getElementById(canvasId);
    var image = new Image();
    var gl, program, buffers, texture;

    function initialize() {
      image.src = imageUrl;
      image.onload = imageOnLoad;

      addEventListeners();
    }

    function imageOnLoad() {
      canvas.width = image.width / 6;
      canvas.height = image.height / 6;

      gl = canvas.getContext('webgl');
      if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
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

      initShaderProgram(vs, fs);
      initBuffers();
      initTexture();

      render();
    }

    function initShaderProgram(vSrc, fSrc) {
      var vShader = loadShader(gl.VERTEX_SHADER, vSrc);
      var fShader = loadShader(gl.FRAGMENT_SHADER, fSrc);

      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vShader);
      gl.attachShader(shaderProgram, fShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      program =  {
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
      return;
    }

    function loadShader(type, src) {
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

    function initBuffers() {
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
    
      buffers = {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
      };
      return;
    }

    function initTexture() {
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
    
      // gl.texImage2D(~, level, internalFormat, width, height, border, srcFormat, srcType, pixel);  // opaque blue
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);  // reserse Y
    
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // gl.texImage2D(~, level, internalFormat, srcFormat, srcType, ~);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
      return;
    }

    function render() {
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

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      // gl.vertexAttribPointer(~, numComponents, type, normalize, stride, offset);
      gl.vertexAttribPointer(program.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.attribLocations.vertexPosition);
    
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
      // gl.vertexAttribPointer(~, numComponents, type, normalize, stride, offset);
      gl.vertexAttribPointer(program.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.attribLocations.textureCoord);
    
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    
      gl.useProgram(program.self);
    
      gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(program.uniformLocations.uSampler, 0);
    
      // gl.drawElements(~, vertexCount, type, offset);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    var self = this;
    var scale = 1.0, scaleStep = 0.1, scaleMin = 1.0, scaleMax = 100.0;

    var events = [];

    function addEventListeners() {
      addEventListener(canvas, 'mousewheel', onMouseWheel);  // except FireFox
    }

    function addEventListener(eventTarget, eventType, listener){
      eventTarget.addEventListener(eventType, listener);
      events.push({eventTarget: eventTarget, eventType: eventType, listener: listener});
    }

    function onMouseWheel(evt) {
      if (!evt) evt = event;
      evt.preventDefault();
      if(evt.detail < 0 || evt.wheelDelta > 0){
        // zoomOut: up -> smaller
        scale = scale * (1 - scaleStep);
        if (scale < scaleMin) return scale = scaleMin;
        render();
      } else {
        // zoomIn: down -> larger
        scale = scale * (1 + scaleStep);
        if (scale > scaleMax) return scale = scaleMax;
        render();
      }
    }

    this.gray = function() {
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
        precision highp float;
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main(void) {
          float color = texture2D(uSampler, vTextureCoord).g;
          gl_FragColor = vec4(color, color, color, 1.0);
        }
      `;

      initShaderProgram(vs, fs);
      render();
    };

    initialize();
  }

  window.Fundus = Fundus;
}(window));