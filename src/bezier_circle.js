import { draw, makeVertices, refresh } from './logic.js';
import options from './options.js';
import { cache } from './options.js';
import controls from './controls.js';

controls.pauseButton.callback = () => 
{
    options.paused = !options.paused;
    if (options.paused) {
        controls.pauseButton.element.innerHTML = "Play";
    } else {
        controls.pauseButton.element.innerHTML = "Pause";
        start(stateCache.vertices, stateCache.time, ctxt, options, cache);
    }
}

const canvas = document.getElementById('canvas');
const ctxt = canvas.getContext('2d');
ctxt.imageSmoothingQuality = "high";
const time = 0; // Initial time, state is maintained recursively.

const vertices = makeVertices(time, options);
const stateCache = { // Store vertex position here on pause.
    vertices,
    time
}

options.beforeCycle = () => drawBackground(ctxt, options);

start(vertices, time, ctxt, options, cache);

function start (vertices, time, ctxt, options, cache)
{
    ctxt.translate(0.5, 0.5);
    drawBackground(ctxt, options);
    loop(vertices, time, ctxt, options, cache);
}

function drawBackground (ctxt, options, transparent = false)
{
    const color = options.bgColor;
    ctxt.fillStyle = transparent ? 
        `rgb(${color}, ${color}, ${color}, ${options.traceAmt})` :
        `rgb(${color}, ${color}, ${color})`;
    ctxt.fillRect(0, 0, 400, 400);
}

function loop (vertices, time, ctxt, options, cache)
{
    drawBackground(ctxt, options, true);

    vertices = refresh(vertices, time, options, cache);

    draw(vertices, ctxt);

    if (!options.paused) {
        next(() => loop(vertices, time + 1, ctxt, options, cache))
    } else {
        stateCache.vertices = vertices;
        stateCache.time = time + 1;
    }
}

function next (fn)
{
    window.requestAnimationFrame(fn);
}

