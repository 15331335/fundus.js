# Fundus.js

Fundus.js is my graduation thesis (design).

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
