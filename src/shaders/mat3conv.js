var fragmentShader = `
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

module.exports = {
  vs: require('./origin').vs,
  fs: fragmentShader
};