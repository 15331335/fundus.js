var ccalls = require('./array');

function draw(canvas, image) {
  var c = document.createElement('canvas');
  c.width = image.width;
  c.height = image.height;
  c.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
  var pixelData = c.getContext('2d').getImageData(0, 0, c.width,c.height).data;
  const pdf = ccalls.ccallArrays("pdf", "array", ["array"], [pixelData], {heapIn: "HEAPU32", heapOut: "HEAPU32", returnArraySize: 4*256});
  var rvals = pdf.slice(0, 256);
  var gvals = pdf.slice(256, 256*2);
  var bvals = pdf.slice(256*2, 256*3);

  var h = document.createElement('canvas');
  h.width = canvas.width;
  h.height = canvas.height;
  var ctx = h.getContext("2d");

  function colorbars(max, vals, color) {
    ctx.fillStyle = color;
    for (var i = 0; i < vals.length; i++) {
      var pct = (vals[i] / max) * h.height/2;
      ctx.fillRect(i*h.width/256, h.height, h.width/256*2, -Math.round(pct));
    }
  }

  colorbars(Math.max.apply(null, rvals), rvals, "rgba(255,0,0,0.7)");
  colorbars(Math.max.apply(null, bvals), gvals, "rgba(0,255,0,0.7)");
  colorbars(Math.max.apply(null, gvals), bvals, "rgba(0,0,255,0.7)");
  canvas.parentNode.appendChild(h);
}

module.exports = {
  draw: draw
};