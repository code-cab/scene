Scene - JavaScript class for timeline animations and parallax effects
===

Scene is a simple but powerful and fast class for creating (CSS) animation and parallax effects.

Scene calls a callback for every element when a _property has changed_ so you only have to implement the 
property values

## Setup

```
npm install scene
```

```
import Scene from 'scene';
```

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

window.addEventListener('scroll', () => scene.animate(window.offsetY));
```

When the target object can be controlled single level properties you can also use the target directly:

```js
scene.addItem(myObj);
scene.addItem(myOtherObj);
scene.step(myObj, 30, {x: 100, y: 200}); // This will call myObj.x and myObj.y
scene.step(myOtherObj, 30, {x: 100, y: 500});
```

## Basic HTML element transition


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



## API

#### new Scene(_startValue_, _endValue_)
Create a new Scene with a range from _startValue_ till _endValue_.

- __startValue__ number
- __endValue__ number


#### scene.addItem(_idOrTarget_ [, _callback_])
Add an item to the scene. Items can be added while dynamically while running.

* __idOrTarget__ Can be a string identifier or an object. When the object is an
instance of HTMLElement and no callback is provided Scene will use HTMLElement 
_style.transform_ property for translation, scaling and rotation.   
When _idOrTarget_ is an object and no callback is provided, the properties
are called from that object.
* __callback__ Optional callback function with parameters:
    - __props__ Object with new property values. The values are iterated 
    between according to the phase, the start and end values from that property
    and the timing function.  
    Please note that the callback is only called when values have changed. 
    - __stepPhases__ Object with the phases (range 0..1) of each property. Phase 
    can be out of the 0..1 range as a result of the chosen timing function.
    - __sceneValue__ Current value of the scene
    - __idOrTarget__ ID or Target of the target item

#### scene.step(_idOrTarget_, _at_, _props_ [, _opts_])


## Timing

__Scene__ supports the following 'tween' timings:

- __ease__, __easein__, __easeout__: 
