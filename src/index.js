(function(window) {
  function Fundus(canvasId, imageUrl, options) {
    var canvas = document.getElementById(canvasId);
    var image = new Image();
    var gl, program, buffers, texture;

    var vs = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying highp vec2 vTextureCoord;
      void main(void) {
        gl_Position = uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;

    var fs = `
      precision highp float;
      varying highp vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform vec4 uColorAlpha;
      void main(void) {
        float red = texture2D(uSampler, vTextureCoord).r * uColorAlpha.x;
        float green = texture2D(uSampler, vTextureCoord).g * uColorAlpha.y;
        float blue = texture2D(uSampler, vTextureCoord).b * uColorAlpha.z;
        gl_FragColor = vec4(red, green, blue, 1.0);
      }
    `;

    function initialize() {
      image.src = imageUrl;
      image.onload = imageOnLoad;

      addEventListeners();
    }

    function imageOnLoad() {
      gl = canvas.getContext('webgl');
      if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
      }

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
          uColorAlpha: gl.getUniformLocation(shaderProgram, 'uColorAlpha'),  // TODO: object option
          uTextureSize: gl.getUniformLocation(shaderProgram, "uTextureSize"),
          uKernel: gl.getUniformLocation(shaderProgram, "uKernel[0]"),
          uKernelWeight: gl.getUniformLocation(shaderProgram, "uKernelWeight"),
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

      var factor = { x: 1.0, y: 1.0 };  // adapt to the canvas
      if ((canvas.width / canvas.height) <= (image.width / image.height)) {
        factor.y = image.height * (canvas.width / image.width) / canvas.height;
      } else {
        factor.x = image.width * (canvas.height / image.height) / canvas.width;
      }

      const positions = [
        -1.0 * factor.x, -1.0 * factor.y,  0.0,
         1.0 * factor.x, -1.0 * factor.y,  0.0,
         1.0 * factor.x,  1.0 * factor.y,  0.0,
        -1.0 * factor.x,  1.0 * factor.y,  0.0,
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
    
      const projectionMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];  // no perspective
      const modelViewMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      for (var i = 0; i < modelViewMatrix.length; i++) {
        if (i < 12) {
          modelViewMatrix[i] = modelViewMatrix[i] * scaleOffset;  // scale
        } else {
          modelViewMatrix[i] = modelViewMatrix[i-12] * translateOffset.x + modelViewMatrix[i-8] * translateOffset.y + modelViewMatrix[i];  // translate
        }
      }

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

      gl.uniform4fv(program.uniformLocations.uColorAlpha, alpha);  // TODO: callback
      gl.uniform2f(program.uniformLocations.uTextureSize, image.width, image.height);
    
      // gl.drawElements(~, vertexCount, type, offset);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    var scaleOffset = 1.0, scaleStep = 0.1, scaleMin = 1.0, scaleMax = 100.0;
    var dragging = false, lastPos = {}, translateStep = 0.002;
    var translateOffset = { x: 0, y: 0 };
    var center = { x: 0, y: 0 };
    var alpha = [1.0, 1.0, 1.0, 1.0];

    function addEventListeners() {
      canvas.addEventListener('mousewheel', onMouseWheel);  // except FireFox
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseout', onMouseOut);
    }

    function onMouseWheel(evt) {
      if (!evt) evt = event;
      evt.preventDefault();
      if (evt.detail < 0 || evt.wheelDelta > 0) {
        // zoomOut: up -> smaller
        scaleOffset = scaleOffset * (1 - scaleStep);
        // if (scaleOffset < scaleMin) return scaleOffset = scaleMin;
        render();
      } else {
        // zoomIn: down -> larger
        scaleOffset = scaleOffset * (1 + scaleStep);
        // if (scaleOffset > scaleMax) return scaleOffset = scaleMax;
        render();
      }
    }

    function onMouseDown(evt){
      if (evt.button === 0) {
        dragging = true;
        lastPos.x = evt.clientX;
        lastPos.y = evt.clientY;
      }
    }

    function onMouseUp(evt) {
      if (evt.button === 0) {
        dragging = false;
        center.x = center.x + (lastPos.x - evt.clientX);
        center.y = center.y + (lastPos.y - evt.clientY);
      }
    }

    function onMouseMove(evt) {
      if (dragging) {
        translateOffset.x = (evt.clientX - lastPos.x - center.x) * translateStep;
        translateOffset.y = (lastPos.y - evt.clientY + center.y) * translateStep;
        render();
      }
    }

    function onMouseOut(evt) {
      dragging = false;  // stop directly
    }

    this.gray = function() {
      var newFs = `
        precision highp float;
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main(void) {
          float color = texture2D(uSampler, vTextureCoord).g;
          gl_FragColor = vec4(color, color, color, 1.0);  // rgb -> ggg
        }
      `;

      initShaderProgram(vs, newFs);
      render();
    };

    this.setColorAlpha = function(channnel, value) {
      var channnels = 'rgb';
      var c = channnels.indexOf(channnel);
      if (c != -1 && value >= 0.0 && value <= 1.0) {
        alpha[c] = value;
        render();
      }
    };

    this.reset = function() {
      scaleOffset = 1.0;
      translateOffset = { x: 0, y: 0 };
      center = { x: 0, y: 0 };
      alpha = [1.0, 1.0, 1.0, 1.0];
      initShaderProgram(vs, fs);
      render();
    };

    var kernel9Fs = `
      precision highp float;
      varying highp vec2 vTextureCoord;
      uniform sampler2D uSampler;

      uniform vec2 uTextureSize;
      uniform float uKernel[9];
      uniform float uKernelWeight;

      void main(void) {
        vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;
        vec4 colorSum =
          texture2D(uSampler, vTextureCoord + onePixel * vec2(-1, -1)) * uKernel[0] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2( 0, -1)) * uKernel[1] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2( 1, -1)) * uKernel[2] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2(-1,  0)) * uKernel[3] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2( 0,  0)) * uKernel[4] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2( 1,  0)) * uKernel[5] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2(-1,  1)) * uKernel[6] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2( 0,  1)) * uKernel[7] +
          texture2D(uSampler, vTextureCoord + onePixel * vec2( 1,  1)) * uKernel[8] ;
        gl_FragColor = vec4((colorSum / uKernelWeight).rgb, 1);
      }
    `;

    this.blur = function() {
      initShaderProgram(vs, kernel9Fs);
      gl.useProgram(program.self);
      gl.uniform1fv(program.uniformLocations.uKernel, kernels['gaussianBlur']);
      gl.uniform1f(program.uniformLocations.uKernelWeight, computeKernelWeight(kernels['gaussianBlur']));
      render();
    };

    this.edge = function() {
      initShaderProgram(vs, kernel9Fs);
      gl.useProgram(program.self);
      gl.uniform1fv(program.uniformLocations.uKernel, kernels['laplacianEdge']);
      gl.uniform1f(program.uniformLocations.uKernelWeight, computeKernelWeight(kernels['laplacianEdge']));
      render();
    };

    function computeKernelWeight(kernel) {
      var weight = kernel.reduce(function(prev, curr) {
          return prev + curr;
      });
      return weight <= 0 ? 1 : weight;
    }

    var kernels = {
      gaussianBlur: [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
      ],
      laplacianEdge: [
        0, -1, 0,
        -1, 4, -1,
        0, -1, 0
      ]
    };

    initialize();
  }

  window.Fundus = Fundus;
}(window));