/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/core.js":
/*!*********************!*\
  !*** ./src/core.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function Fundus(canvasId, imageUrl, wasmUrl, options) {\n  var canvas = document.getElementById(canvasId);\n  var image = new Image();\n  var gl, program, buffers, texture;\n\n  var originShader = __webpack_require__(/*! ./shaders/origin */ \"./src/shaders/origin.js\");\n\n  function initialize() {\n    image.src = imageUrl;\n    image.onload = imageOnLoad;\n\n    addEventListeners();\n  }\n\n  function imageOnLoad() {\n    gl = canvas.getContext('webgl');\n    if (!gl) {\n      alert('Unable to initialize WebGL. Your browser or machine may not support it.');\n      return;\n    }\n\n    initShaderProgram(originShader.vs, originShader.fs);\n    initBuffers();\n    initTexture();\n\n    render();\n  }\n\n  function initShaderProgram(vSrc, fSrc, uObj) {\n    var vShader = loadShader(gl.VERTEX_SHADER, vSrc);\n    var fShader = loadShader(gl.FRAGMENT_SHADER, fSrc);\n\n    var shaderProgram = gl.createProgram();\n    gl.attachShader(shaderProgram, vShader);\n    gl.attachShader(shaderProgram, fShader);\n    gl.linkProgram(shaderProgram);\n\n    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {\n      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));\n      return null;\n    }\n\n    program =  {\n      self: shaderProgram,\n      attribLocations: {\n        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),\n        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),\n      },\n      uniformLocations: {\n        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),\n        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),\n      },\n    };\n\n    if (uObj) {\n      for (var key in uObj) {\n        program.uniformLocations[key] = gl.getUniformLocation(shaderProgram, uObj[key]);\n      }\n    }\n\n    return;\n  }\n\n  function loadShader(type, src) {\n    var shader = gl.createShader(type);\n    gl.shaderSource(shader, src);\n    gl.compileShader(shader);\n  \n    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\n      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));\n      gl.deleteShader(shader);\n      return null;\n    }\n  \n    return shader;\n  }\n\n  function initBuffers() {\n    var positionBuffer = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\n\n    var factor = { x: 1.0, y: 1.0 };  // adapt to the canvas\n    if ((canvas.width / canvas.height) <= (image.width / image.height)) {\n      factor.y = image.height * (canvas.width / image.width) / canvas.height;\n    } else {\n      factor.x = image.width * (canvas.height / image.height) / canvas.width;\n    }\n\n    const positions = [\n      -1.0 * factor.x, -1.0 * factor.y,  0.0,\n        1.0 * factor.x, -1.0 * factor.y,  0.0,\n        1.0 * factor.x,  1.0 * factor.y,  0.0,\n      -1.0 * factor.x,  1.0 * factor.y,  0.0,\n    ];\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);\n  \n    var textureCoordBuffer = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);\n    const textureCoordinates = [\n      0.0,  1.0,\n      1.0,  1.0,\n      1.0,  0.0,\n      0.0,  0.0,\n    ];\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);\n\n    var indexBuffer = gl.createBuffer();\n    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\n    const indices = [\n      0,  1,  2,      \n      0,  2,  3,\n    ];\n    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);\n  \n    buffers = {\n      position: positionBuffer,\n      textureCoord: textureCoordBuffer,\n      indices: indexBuffer,\n    };\n    return;\n  }\n\n  function initTexture() {\n    texture = gl.createTexture();\n    gl.bindTexture(gl.TEXTURE_2D, texture);\n\n    // gl.texImage2D(~, level, internalFormat, srcFormat, srcType, ~);\n    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\n    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\n  \n    return;\n  }\n\n  function render(uFunc) {\n    const modelViewMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];\n    for (var i = 0; i < modelViewMatrix.length; i++) {\n      if (i < 12) {\n        modelViewMatrix[i] = modelViewMatrix[i] * scaleOffset;  // scale\n      } else {\n        modelViewMatrix[i] = modelViewMatrix[i-12] * translateOffset.x + modelViewMatrix[i-8] * translateOffset.y + modelViewMatrix[i];  // translate\n      }\n    }\n\n    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);\n    // gl.vertexAttribPointer(~, numComponents, type, normalize, stride, offset);\n    gl.vertexAttribPointer(program.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);\n    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);\n  \n    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);\n    gl.vertexAttribPointer(program.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);\n    gl.enableVertexAttribArray(program.attribLocations.textureCoord);\n  \n    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);\n  \n    gl.useProgram(program.self);\n    gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, modelViewMatrix);\n    if (uFunc) uFunc();\n  \n    gl.activeTexture(gl.TEXTURE0);\n    gl.bindTexture(gl.TEXTURE_2D, texture);\n    gl.uniform1i(program.uniformLocations.uSampler, 0);\n  \n    // gl.drawElements(~, vertexCount, type, offset);\n    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);\n  }\n\n  var scaleOffset = 1.0, scaleStep = 0.1;  // scaleMin = 1.0, scaleMax = 100.0;\n  var dragging = false, lastPos = {}, translateStep = 0.002;\n  var translateOffset = { x: 0, y: 0 };\n  var center = { x: 0, y: 0 };\n\n  function addEventListeners() {\n    canvas.addEventListener('mousewheel', onMouseWheel);  // except FireFox\n    canvas.addEventListener('mousedown', onMouseDown);\n    canvas.addEventListener('mouseup', onMouseUp);\n    canvas.addEventListener('mousemove', onMouseMove);\n    canvas.addEventListener('mouseout', onMouseOut);\n  }\n\n  function onMouseWheel(evt) {\n    if (!evt) evt = event;\n    evt.preventDefault();\n    if (evt.detail < 0 || evt.wheelDelta > 0) {\n      // zoomOut: up -> smaller\n      scaleOffset = scaleOffset * (1 - scaleStep);\n      // if (scaleOffset < scaleMin) return scaleOffset = scaleMin;\n      render();\n    } else {\n      // zoomIn: down -> larger\n      scaleOffset = scaleOffset * (1 + scaleStep);\n      // if (scaleOffset > scaleMax) return scaleOffset = scaleMax;\n      render();\n    }\n  }\n\n  function onMouseDown(evt){\n    if (evt.button === 0) {\n      dragging = true;\n      lastPos.x = evt.clientX;\n      lastPos.y = evt.clientY;\n    }\n  }\n\n  function onMouseUp(evt) {\n    if (evt.button === 0) {\n      dragging = false;\n      center.x = center.x + (lastPos.x - evt.clientX);\n      center.y = center.y + (lastPos.y - evt.clientY);\n    }\n  }\n\n  function onMouseMove(evt) {\n    if (dragging) {\n      translateOffset.x = (evt.clientX - lastPos.x - center.x) * translateStep;\n      translateOffset.y = (lastPos.y - evt.clientY + center.y) * translateStep;\n      render();\n    }\n  }\n\n  function onMouseOut(evt) {\n    dragging = false;  // stop directly\n  }\n\n  this.reset = function() {\n    scaleOffset = 1.0;\n    translateOffset = { x: 0, y: 0 };\n    center = { x: 0, y: 0 };\n    initShaderProgram(originShader.vs, originShader.fs);\n    render();\n  };\n\n  this.mat3Convolution = function(kernel) {\n    var weight = kernel.reduce((prev, curr) => prev + curr);\n    var shader = __webpack_require__(/*! ./shaders/mat3conv */ \"./src/shaders/mat3conv.js\");\n\n    initShaderProgram(shader.vs, shader.fs,  {\n      uTextureSize: 'uTextureSize',\n      uKernel: 'uKernel[0]',\n      uKernelWeight: 'uKernelWeight'\n    });\n    render(function() {\n      gl.uniform2f(program.uniformLocations.uTextureSize, image.width, image.height);\n      gl.uniform1fv(program.uniformLocations.uKernel, kernel);\n      gl.uniform1f(program.uniformLocations.uKernelWeight, weight <= 0 ? 1 : weight);\n    });\n  };\n\n  this.histEqualization = function() {\n    var cdf = __webpack_require__(/*! ./wasms/cdf */ \"./src/wasms/cdf.js\").getCDF(image);\n    var shader = __webpack_require__(/*! ./shaders/histe */ \"./src/shaders/histe.js\");\n\n    initShaderProgram(shader.vs, shader.fs,  {\n      uSum: 'uSum',\n      uRcdf: 'uRcdf[0]',\n      uGcdf: 'uGcdf[0]',\n      uBcdf: 'uBcdf[0]'\n    });\n    render(function() {\n      gl.uniform1f(program.uniformLocations.uSum, image.width * image.height);\n      gl.uniform1fv(program.uniformLocations.uRcdf, cdf.r);\n      gl.uniform1fv(program.uniformLocations.uGcdf, cdf.g);\n      gl.uniform1fv(program.uniformLocations.uBcdf, cdf.b);\n    });\n  }\n\n  if (!window.wasmLoaded) {\n    var wasmscript = document.createElement(\"script\")\n    wasmscript.type = \"text/javascript\";\n    wasmscript.onload = function() {\n      window.addEventListener(\"wasmLoaded\", () => {\n        window.wasmLoaded = true;\n        initialize();\n      });\n    };\n    wasmscript.src = wasmUrl;\n    document.body.appendChild(wasmscript);\n  } else {\n    initialize();\n  }\n}\n\nmodule.exports = Fundus;\n\n//# sourceURL=webpack:///./src/core.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var Fundus = __webpack_require__(/*! ./core */ \"./src/core.js\");\n(function(window) {\n  window.wasmLoaded = false;\n  window.Fundus = Fundus;\n})(window);\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/shaders/histe.js":
/*!******************************!*\
  !*** ./src/shaders/histe.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var fragmentShader = `\n  precision highp float;\n  varying highp vec2 vTextureCoord;\n  uniform sampler2D uSampler;\n\n  uniform float uSum;\n  uniform float uRcdf[256];\n  uniform float uGcdf[256];\n  uniform float uBcdf[256];\n\n  float getValue(int index, float array[256]) {\n    for (int i = 0; i < 256; i++) {\n      if (i == index) return array[i];\n    }\n  }\n\n  void main(void) {\n    float r = texture2D(uSampler, vTextureCoord).r;\n    float g = texture2D(uSampler, vTextureCoord).g;\n    float b = texture2D(uSampler, vTextureCoord).b;\n\n    r = r * getValue(int(r*255.0), uRcdf) / uSum;\n    g = g * getValue(int(g*255.0), uGcdf) / uSum;\n    b = b * getValue(int(b*255.0), uBcdf) / uSum;\n\n    gl_FragColor = vec4(r, g, b, 1);\n  }\n`;\n\nmodule.exports = {\n  vs: __webpack_require__(/*! ./origin */ \"./src/shaders/origin.js\").vs,\n  fs: fragmentShader\n};\n\n//# sourceURL=webpack:///./src/shaders/histe.js?");

/***/ }),

/***/ "./src/shaders/mat3conv.js":
/*!*********************************!*\
  !*** ./src/shaders/mat3conv.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var fragmentShader = `\n  precision highp float;\n  varying highp vec2 vTextureCoord;\n  uniform sampler2D uSampler;\n\n  uniform vec2 uTextureSize;\n  uniform float uKernel[9];\n  uniform float uKernelWeight;\n\n  void main(void) {\n    vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;\n    vec4 colorSum =\n      texture2D(uSampler, vTextureCoord + onePixel * vec2(-1, -1)) * uKernel[0] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2( 0, -1)) * uKernel[1] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2( 1, -1)) * uKernel[2] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2(-1,  0)) * uKernel[3] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2( 0,  0)) * uKernel[4] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2( 1,  0)) * uKernel[5] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2(-1,  1)) * uKernel[6] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2( 0,  1)) * uKernel[7] +\n      texture2D(uSampler, vTextureCoord + onePixel * vec2( 1,  1)) * uKernel[8] ;\n    gl_FragColor = vec4((colorSum / uKernelWeight).rgb, 1);\n  }\n`;\n\nmodule.exports = {\n  vs: __webpack_require__(/*! ./origin */ \"./src/shaders/origin.js\").vs,\n  fs: fragmentShader\n};\n\n//# sourceURL=webpack:///./src/shaders/mat3conv.js?");

/***/ }),

/***/ "./src/shaders/origin.js":
/*!*******************************!*\
  !*** ./src/shaders/origin.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var vertexShader = `\n  attribute vec4 aVertexPosition;\n  attribute vec2 aTextureCoord;\n  uniform mat4 uModelViewMatrix;\n  varying highp vec2 vTextureCoord;\n  void main(void) {\n    gl_Position = uModelViewMatrix * aVertexPosition;\n    vTextureCoord = aTextureCoord;\n  }\n`;\n\nvar fragmentShader = `\n  precision highp float;\n  varying highp vec2 vTextureCoord;\n  uniform sampler2D uSampler;\n  void main(void) {\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n  }\n`;\n\nmodule.exports = {\n  vs: vertexShader,\n  fs: fragmentShader\n};\n\n//# sourceURL=webpack:///./src/shaders/origin.js?");

/***/ }),

/***/ "./src/wasms/array.js":
/*!****************************!*\
  !*** ./src/wasms/array.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("const ccallArrays = (func, returnType, paramTypes=[], params, {heapIn=\"HEAPF32\", heapOut=\"HEAPF32\", returnArraySize=1}={}) => {\n  const heapMap = {}\n  heapMap.HEAP8 = Int8Array // int8_t\n  heapMap.HEAPU8 = Uint8Array // uint8_t\n  heapMap.HEAP16 = Int16Array // int16_t\n  heapMap.HEAPU16 = Uint16Array // uint16_t\n  heapMap.HEAP32 = Int32Array // int32_t\n  heapMap.HEAPU32 = Uint32Array // uint32_t\n  heapMap.HEAPF32 = Float32Array // float\n  heapMap.HEAPF64 = Float64Array // double\n\n  let res\n  let error\n  const returnTypeParam = returnType==\"array\" ? \"number\" : returnType\n  const parameters = []\n  const parameterTypes = []\n  const bufs = []\n\n  try {\n    if (params) {\n      for (let p=0; p<params.length; p++) {\n\n        if (paramTypes[p] == \"array\" || Array.isArray(params[p])) {\n\n          const typedArray = new heapMap[heapIn](params[p].length)\n\n          for (let i=0; i<params[p].length; i++) {\n            typedArray[i] = params[p][i]\n          }\n\n          const buf = Module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT)\n\n          switch (heapIn) {\n            case \"HEAP8\": case \"HEAPU8\":\n              Module[heapIn].set(typedArray, buf)\n              break\n            case \"HEAP16\": case \"HEAPU16\":\n              Module[heapIn].set(typedArray, buf >> 1)\n              break\n            case \"HEAP32\": case \"HEAPU32\": case \"HEAPF32\":\n              Module[heapIn].set(typedArray, buf >> 2)\n              break\n            case \"HEAPF64\":\n              Module[heapIn].set(typedArray, buf >> 3)\n              break\n          }\n\n          bufs.push(buf)\n          parameters.push(buf)\n          parameters.push(params[p].length)\n          parameterTypes.push(\"number\")\n          parameterTypes.push(\"number\")\n\n        } else {\n          parameters.push(params[p])\n          parameterTypes.push(paramTypes[p]==undefined ? \"number\" : paramTypes[p])\n        }\n      }\n    }\n\n    res = Module.ccall(func, returnTypeParam, parameterTypes, parameters)\n  } catch (e) {\n    error = e\n  } finally {\n    for (let b=0; b<bufs.length; b++) {\n      Module._free(bufs[b])\n    }\n  }\n\n  if (error) throw error\n\n  if (returnType==\"array\") {\n    const returnData = []\n\n    for (let v=0; v<returnArraySize; v++) {\n      returnData.push(Module[heapOut][res/heapMap[heapOut].BYTES_PER_ELEMENT+v])\n    }\n\n    return returnData\n  } else {\n    return res\n  }\n}\n// Wrap around cwrap also, as a bonus\nconst cwrapArrays = (func, returnType, paramTypes, {heapIn=\"HEAPF32\", heapOut=\"HEAPF32\", returnArraySize=1}={}) => {\n  return params => ccallArrays(func, returnType, paramTypes, params, {heapIn, heapOut, returnArraySize})\n}\n\nmodule.exports = {\n  ccallArrays: ccallArrays,\n  cwrapArrays: cwrapArrays\n};\n\n//# sourceURL=webpack:///./src/wasms/array.js?");

/***/ }),

/***/ "./src/wasms/cdf.js":
/*!**************************!*\
  !*** ./src/wasms/cdf.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var ccalls = __webpack_require__(/*! ./array */ \"./src/wasms/array.js\");\n\nfunction getCDF(image) {\n  var c = document.createElement('canvas');\n  c.width = image.width;\n  c.height = image.height;\n  c.getContext('2d').drawImage(image, 0, 0, image.width, image.height);\n  var pixelData = c.getContext('2d').getImageData(0, 0, c.width,c.height).data;\n  const cdf = ccalls.ccallArrays(\"CDF\", \"array\", [\"array\"], [pixelData], {heapIn: \"HEAPU32\", heapOut: \"HEAPU32\", returnArraySize: 4*256});\n  var rvals = cdf.slice(0, 256);\n  var gvals = cdf.slice(256, 256*2);\n  var bvals = cdf.slice(256*2, 256*3);\n\n  return {\n    r: rvals,\n    g: gvals,\n    b: bvals\n  };\n}\n\nmodule.exports = {\n  getCDF: getCDF\n};\n\n//# sourceURL=webpack:///./src/wasms/cdf.js?");

/***/ })

/******/ });