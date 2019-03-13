# Fundus.js

Fundus.js is my graduation design.

## Attention

1. Install `WebAssembly` so that replace the `dist/gl-matrix.js`.

2. Check the `dist/index.html` to understand the order of scripts.

3. Use `npm` to install and run `compile` before `test`.

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

## TODO

...