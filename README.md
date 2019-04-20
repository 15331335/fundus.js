# Fundus.js

Fundus.js is my graduation design.

## Attention

1. Install `WebAssembly`.
2. Run `compile` before `test`.

## Demo

A canvas element with an id in HTML:

```html
<canvas id="glcanvas" width="640" height="480">
    Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
</canvas>
```

It is the fundus in JS:

```javascript
var f = new Fundus('glcanvas', 'http://localhost:8080/image.jpg');
```

## Api

- `reset()`: reset the image to origin.
- `setMat3kernel(kernel)`: the convolution kernel need a `3*3 matrix`