var ccalls = require('./array');

function getCDF(image) {
  var c = document.createElement('canvas');
  c.width = image.width;
  c.height = image.height;
  c.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
  var pixelData = c.getContext('2d').getImageData(0, 0, c.width,c.height).data;
  const cdf = ccalls.ccallArrays("CDF", "array", ["array"], [pixelData], {heapIn: "HEAPU32", heapOut: "HEAPU32", returnArraySize: 4*256});
  var rvals = cdf.slice(0, 256);
  var gvals = cdf.slice(256, 256*2);
  var bvals = cdf.slice(256*2, 256*3);

  return {
    r: rvals,
    g: gvals,
    b: bvals
  };
}

module.exports = {
  getCDF: getCDF
};