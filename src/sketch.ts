import p5 from 'p5'
import {BezierCircle} from './circle'
import { setDefaultFunction } from './utils'

// -------------- SETUP ---------------- //

type SketchParams = {
  width?: number,
  height?: number,
  radius?: number,
  cycleSpeed?: number,
  contractionSize?: number,
  backgroundColor: number,
  vertices?: number,
  traces?: number,

  setupDone?: Function,
  beforeCycle?: Function,
}

const populateDefaultFields = (p: any, params: SketchParams) => {

  p.backgroundColor = params.backgroundColor || 40;
  p.sketchWidth = params.width || 500;
  p.sketchHeight = params.height || 500;
  p.radius = params.radius || 100;
  p.cycleSpeed = params.cycleSpeed || 100;
  p.contractionSize = params.contractionSize || 1;
  p.vertices = params.vertices || 20;
  p.traces = params.traces || 1.5;

  p.setupDone = setDefaultFunction(params.setupDone, (p: any) => { console.log("Setup done.")});
  p.beforeCycle = setDefaultFunction(params.beforeCycle, (p: any) => {});
  p.paused = false;

}

const sketchSetup = (p: any) => {
  return () => {

    p.createCanvas(p.sketchWidth, p.sketchHeight);
    p.background(p.backgroundColor);

    p.circle = new BezierCircle(p, {
      vertices: p.vertices,
      cycleSpeed: p.cycleSpeed,
      contractionSize: p.contractionSize,
      contractionFunc: (i: number) => { return p.noise(i) }
    });

    // The circle's beforeCycle callback calls the user-provided beforeCycle callback.
    p.circle.beforeCycle = () => {
      p.beforeCycle(p);
    }

    // The user-provided setupDone callback.
	  p.setupDone(p);

  }
}

const sketchDraw = (p: any) => {
  return () => {

    p.circle.refresh(p.frameCount);

    p.noFill();
    p.stroke(255);
    p.strokeWeight(1);
    p.circle.draw(p);

    p.fill(p.backgroundColor, p.traces);
		p.rect(0, 0, p.width, p.height);

  }
}

const sketch = (params: SketchParams) => {
	return (p: any) => {

    populateDefaultFields(p, params);

		p.setup = sketchSetup(p);

		p.draw = sketchDraw(p);

  }
}

export const makeSketch = (containerId: string, params: SketchParams = {}) => {

	const container = document.getElementById(containerId);
  return new p5(sketch(params), container);

}
