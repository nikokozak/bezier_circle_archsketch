import options from './options.js';

class Controls {

    constructor (controlIDs = []) {

        this.controls = {};

        if (controlIDs.length > 0) {
            this.controls = controlIDs.reduce(
            (acc, id) => { 
                acc[id] = makeController(id); return acc; 
            }, {});
        }

        return this.controls;
    }
}

function makeController (id) 
{
    const element = document.getElementById(id);

    // set as object so we can redefine in future
    const controller = {
        element,
        value: element.value,
        // register the callback
        set callback (fn) { 
            if (element.type == "range") element.oninput = fn;
            if (element.type == "submit") element.addEventListener('click', fn);
        }
    }

    return controller;
}

const controls = new Controls(['contractionSlider', 'radiusSlider', 'verticesSlider', 'tracesSlider', 'speedSlider', 'pauseButton']);

controls.contractionSlider.callback = (e) => options.contractionSize = e.target.value;
options.contractionSize = controls.contractionSlider.value;

controls.radiusSlider.callback = (e) => options.radius = e.target.value;
options.radius = controls.radiusSlider.value;

controls.verticesSlider.callback = (e) => options.numVertices = e.target.value;
options.numVertices = controls.verticesSlider.value;

controls.tracesSlider.callback = (e) => options.traceAmt = e.target.value;
options.traceAmt = controls.tracesSlider.value;

controls.speedSlider.callback = (e) => options.cycleSpeed = e.target.value;
options.cycleSpeed = controls.speedSlider.value;

export default controls;
