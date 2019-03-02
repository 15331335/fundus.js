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
    
      const fieldOfView = 45 * Math.PI / 180;
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = mat4.create();
      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    
      const modelViewMatrix = mat4.create();
      mat4.identity(modelViewMatrix);
      mat4.scale(modelViewMatrix, modelViewMatrix, [scaleOffset, scaleOffset, scaleOffset]);
      mat4.translate(modelViewMatrix, modelViewMatrix, [translateOffset.x, translateOffset.y, 0.0]);

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
    
      // gl.drawElements(~, vertexCount, type, offset);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    var self = this;
    var scaleOffset = 1.0, scaleStep = 0.1, scaleMin = 1.0, scaleMax = 100.0;
    var dragging = false, lastPos = {}, translateStep = 0.002;
    var translateOffset = { x: 0, y: 0 };
    var center = { x: 0, y: 0 };
    var alpha = [1.0, 1.0, 1.0, 1.0];

    var events = [];

    function addEventListeners() {
      addEventListener(canvas, 'mousewheel', onMouseWheel);  // except FireFox
      addEventListener(canvas, 'mousedown', onMouseDown);
      addEventListener(canvas, 'mouseup', onMouseUp);
      addEventListener(canvas, 'mousemove', onMouseMove);
      addEventListener(canvas, 'mouseout', onMouseOut);
    }

    function addEventListener(eventTarget, eventType, listener){
      eventTarget.addEventListener(eventType, listener);
      events.push({
        eventTarget: eventTarget,
        eventType: eventType,
        listener: listener
      });
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
        console.log('mouse up');
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
      console.log('mouse out');
      dragging = false;  // stop directly
    }

    this.gray = function() {
      var newFs = `
        precision highp float;
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main(void) {
          float color = texture2D(uSampler, vTextureCoord).g;
          gl_FragColor = vec4(color, color, color, 1.0);
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

    this.origin = function() {
      alpha = [1.0, 1.0, 1.0, 1.0];
      initShaderProgram(vs, fs);
      render();
    };

    initialize();
  }

  window.Fundus = Fundus;
}(window));