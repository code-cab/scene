Scene - Backbone for timeline animations and parallax effects
===

Scene is a simple but powerfull and fast class for creating (CSS) animation and parallax effects.

Scene calls a callback for every element when a _property has changed_ so you only have to implement the 
property values

### Demo

Demo [here](https://github.com/code-cab/scene/blob/master/docs/index.html)

### Setup

npm install scene

import Scene from 'scene';

## Basic parallax example
```js
import Scene from 'scene';

const scene = new Scene(0, 1000);

scene.addItem('someObj', props => {
    myObj.x = props.x;
    myObj.y = props.y;
    myObj.scale.x = myObj.scale.y = props.scale;
});
scene.step('someObj', 0, {x: 0, y: 0, scale: 1});
scene.step('someObj', 200, {x: 100, y: 200});
scene.step('someObj', 400, {x: -200, y: 100}, {timing: 'ease'});

function animate() {
    scene.animate(window.offsetY);
    requestAnimationFrame(animate);
}
animate();
```


### Basic HTML element transition

```html
<html>
    <style> #myElem { position: absolute; display: inline-block; } </style>
    <span id="myElem">Hello world</span>
</html>
```
```js
import Scene from 'scene';

const period = 5000;
const scene = new Scene(0, period);
const myElem = document.getElementById('myElem');

scene.addItem(myElem);
scene.step(myElem, 0 * period, {x: 0, y: 0, rotate: 0, scale: 1});
scene.step(myElem, 0.5 * period, {x: 100, y: 100, rotate: 180, scale: 2});
scene.step(myElem, 1 * period, {x: 0, y: 0, rotate: 360, scale: 1});

function animate() {
    scene.animate(performance.now() % period);
    requestAnimationFrame(animate);
}
animate();
```


