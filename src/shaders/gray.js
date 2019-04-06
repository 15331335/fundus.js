var fragmentShader = `
  precision highp float;
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform float uGrayChannel[3];

  void main(void) {
    float gray;
    for (int i = 0; i < 3; i++) {
      gray += texture2D(uSampler, vTextureCoord)[i] * uGrayChannel[i];
    }
    gl_FragColor = vec4(gray, gray, gray, 1.0);
  }
`;

module.exports = {
  vs: require('./origin').vs,
  fs: fragmentShader
};