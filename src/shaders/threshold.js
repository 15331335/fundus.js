var fragmentShader = `
  precision highp float;
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform float uThreshold;

  void main(void) {
    float gray = texture2D(uSampler, vTextureCoord).g;
    gl_FragColor.rgb = texture2D(uSampler, vTextureCoord).rgb;
    gl_FragColor.a = step(uThreshold, gray);  // returns 0.0 if x is smaller then edge and otherwise 1.0.
  }
`;

module.exports = {
  vs: require('./origin').vs,
  fs: fragmentShader
};