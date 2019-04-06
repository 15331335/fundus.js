var vertexShader = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uModelViewMatrix;
  varying highp vec2 vTextureCoord;
  void main(void) {
    gl_Position = uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
`;

var fragmentShader = `
  precision highp float;
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;

module.exports = {
  vs: vertexShader,
  fs: fragmentShader
};