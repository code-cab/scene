import Scene from '../src/scene.js';

const period = 1000;
const height = 100;
const paddingV = 20;
const paddingH = 5;
const step = 10;

const scripts = [
`// Lineair
const scene = new Scene(0, period);
scene.addItem('demo', demoCallback);
scene.step('demo', 150, {y: 100});
scene.step('demo', 300, {x: -100, y: -100});
scene.step('demo', 400, {x: 50});
scene.step('demo', 600, {x: -50, y: 50});
scene.step('demo', 700, {x: 100});`,

`// Lineair circular
const scene = new Scene(0, period);
scene.circular = true;
scene.addItem('demo', demoCallback);
scene.step('demo', 150, {y: 100});
scene.step('demo', 300, {x: -100, y: -100});
scene.step('demo', 400, {x: 50});
scene.step('demo', 600, {x: -50, y: 50});
scene.step('demo', 700, {x: 100});`,

`// Lineair smooth
const scene = new Scene(0, period);
scene.addItem('demo', demoCallback);
scene.step('demo', 150, {y: 100});
scene.step('demo', 300, {x: -100, y: -100});
scene.step('demo', 400, {x: 50});
scene.step('demo', 600, {x: -50, y: 50});
scene.step('demo', 700, {x: 100});
scene.smooth('demo', ['x', 'y']);
`,
    `// Lineair smooth cirlular
const scene = new Scene(0, period);
scene.circular = true;
scene.addItem('demo', demoCallback);
scene.step('demo', 150, {y: 100});
scene.step('demo', 300, {x: -100, y: -100});
scene.step('demo', 400, {x: 50});
scene.step('demo', 600, {x: -50, y: 50});
scene.step('demo', 700, {x: 100});
scene.smooth('demo', ['x', 'y']);
`,

    `// Sinus easing
const scene = new Scene(0, period);
scene.addItem('demo', demoCallback);
scene.step('demo', 0, {y: -100});
scene.step('demo', 500, {y: 100}, {timing: 'sinOut'});
scene.step('demo', 1000, {y: -100}, {timing: 'sinInOut'});`,

`// Sinus easing
const scene = new Scene(0, period);
scene.addItem('demo', demoCallback);
scene.step('demo', 0, {y: -100});
scene.step('demo', 500, {y: 100}, {timing: 'powInOut 6'});
scene.step('demo', 1000, {y: -100}, {timing: 'cubIn'});`,

`// Back easing
const scene = new Scene(0, period);
scene.addItem('demo', demoCallback);
scene.step('demo', 0, {x: -100, y: -100});
scene.step('demo', 500, {y: 100}, {timing: 'backInOut'});
scene.step('demo', 500, {x: 100}, {timing: 'backOut'});
scene.step('demo', 1000, {y: -100}, {timing: 'backIn 2'});
scene.step('demo', 1000, {x: -100}, {timing: 'backInOut'});`,

`// Circ easing
const scene = new Scene(0, period);
scene.addItem('demo', demoCallback);
scene.step('demo', 0, {x: -100});
scene.step('demo', 250, {y: 100}, {timing: 'circIn'});
scene.step('demo', 500, {x: 100}, {timing: 'circIn'});
scene.step('demo', 750, {y: -100}, {timing: 'circOut'});
scene.step('demo', 1000, {x: -100}, {timing: 'circOut'});`,

`// Elastic easing
const scene = new Scene(0, period);
scene.addItem('demo', demoCallback);
scene.step('demo', 0, {x: -100, y: -100});
scene.step('demo', 500, {y: 100}, {timing: 'elasticInOut'});
scene.step('demo', 500, {x: 100}, {timing: 'elasticOut'});
scene.step('demo', 1000, {y: -100}, {timing: 'elasticIn'});
scene.step('demo', 1000, {x: -100}, {timing: 'elasticInOut'});`,
// `// Events and strings
// const scene = new Scene(0, period);
// scene.addItem('demo', 0, {funcProp:val=>console.log('event'), type=''});
// scene.addItem('demo', 500, {funcProp:0, type='hello'})`,
];

const animations = [];

function runHelloWorld() {
    const period = 5000;
    const scene = new Scene(0, period);
    const myElem = document.getElementById('myElem');
    scene.addItem(myElem);
    scene.step(myElem, 0 * period, {x: 0, y: 0, rotate: 0, scale: 1});
    scene.step(myElem, 0.5 * period, {x: 100, y: 100, rotate: 180, scale: 2});
    scene.step(myElem, 1 * period, {x: 0, y: 0, rotate: 360, scale: 1});

    const animate = () => {
        scene.animate((window.scrollY * period / (document.body.clientHeight - window.innerHeight)) || ((performance.now()/2) % period));
        requestAnimationFrame(animate);
    };
    animate();

}
function runTests() {
    for (let i = 0; i < scripts.length; i += 1) {
        let script = scripts[i];
        let desc = document.createElement('pre');
        let canvas = drawScene(script);
        desc.innerText = script.replace(/demoCallback/g, 'props => plot(props.x, props.y)');
        let aniCanvas = drawAnimation(script);
        let wrap = document.createElement('div');
        wrap.append(canvas);
        wrap.append(aniCanvas);
        wrap.append(desc);
        let demos = document.getElementById('demos');
        demos.appendChild(wrap);
    }
}


function drawScene(script) {
    const canvas = document.createElement('canvas');
    let scene = eval(`(function(){${script};return scene})();`);
    canvas.width = scene.endValue +2*paddingH;
    canvas.height = height + 2*paddingV;
    let g = canvas.getContext('2d');
    for (let i = 0; i <= period; i += step) {
        scene.animate(i);
    }

    function demoCallback(props, stepPhases, sceneValue) {
        mark(props.x, 'red');
        mark(props.y, 'blue');

        function mark(val, color) {
            if (val !== undefined) {
                g.beginPath();
                g.arc(sceneValue + paddingH, height/2 + paddingV - val / 2, 3, 0, 2*Math.PI, false);
                g.fillStyle = color;
                g.fill();
            }
        }
    }

    return canvas;

}

function drawAnimation(script) {
    const canvas = document.createElement('canvas');
    canvas.height = canvas.width = height + 2*paddingV;
    let g = canvas.getContext('2d');

    let scene = eval(`(function(){${script};return scene})();`);

    function demoCallback(props) {
        g.clearRect(0, 0, canvas.width, canvas.height);
        let x = props.x || 0;
        let y = props.y || 0;
        g.beginPath();
        g.arc(height/2 + paddingV + x/2, height/2 + paddingV - y/2, 3, 0, 2*Math.PI, false);
        g.fillStyle = 'blue';
        g.fill();
    }

    animations.push(() => {
        scene.animate((window.scrollY * period / (document.body.clientHeight - window.innerHeight)) || ((performance.now()/2) % period));
    });
    return canvas;
}

function animate() {
    for (let animation of animations) {
        animation();
    }
    requestAnimationFrame(animate);
}

function addPageParallax() {
    function callback(props, stepPhases, value, elem) {
        elem.style.top = `${props.top}px`;
    }

    let scene = new Scene(0, 0);
    let demos = document.getElementById('demos');
    let i = 0;

    for (let idx = 0; idx < demos.children.length; idx += 1) {
        let div = demos.children[idx];
        scene.addItem(div, callback);
        let height =100;

        scene.step(div, i, {scale: 1, top: 300});
        scene.step(div, i + 0.2*height, {top: 0, scale: 2});
        scene.step(div, i + 0.8*height, {top: 0, scale: 2});
        scene.step(div, i + height, {top: -300, scale: 1});
        i += height;
    }
    scene.endValue = i + window.innerHeight;
    document.body.style.height = scene.endValue + 'px';
    scene.animate(0);
    window.addEventListener('scroll', () => {
        scene.animate(window.scrollY)
    });

}
// runHelloWorld();
runTests();
animate();
addPageParallax();
