var fragmentShader = `
  precision highp float;
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;

  uniform float uSum;
  uniform float uRcdf[256];
  uniform float uGcdf[256];
  uniform float uBcdf[256];

  float getValue(int index, float array[256]) {
    for (int i = 0; i < 256; i++) {
      if (i == index) return array[i];
    }
  }

  void main(void) {
    float r = texture2D(uSampler, vTextureCoord).r;
    float g = texture2D(uSampler, vTextureCoord).g;
    float b = texture2D(uSampler, vTextureCoord).b;

    r = r * getValue(int(r*255.0), uRcdf) / uSum;
    g = g * getValue(int(g*255.0), uGcdf) / uSum;
    b = b * getValue(int(b*255.0), uBcdf) / uSum;

    gl_FragColor = vec4(r, g, b, 1);
  }
`;

module.exports = {
  vs: require('./origin').vs,
  fs: fragmentShader
};