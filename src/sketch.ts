import p5 from 'p5'
import {BezierCircle} from './circle'

// -------------- SETUP ---------------- //

const size = {
	width: 500,
	height: 500
}

const sketch = (setupDoneCallback: Function, beforeCycleCallback: Function) => {
	return (p: any) => {

		p.fader;
		p.circle;
		p.opacitySpeed = 12;

		p.setupDone = (() => {

			if (setupDoneCallback) {
				return setupDoneCallback;
			} else {
				return (p: any) => { console.log("P5 Setup Done"); }
			}

		})();

		p.beforeCycle = (() => {

			if (beforeCycleCallback) {
				return beforeCycleCallback;
			} else {
				return (p: any) => { console.log("Circe Before Cycle"); }
			}

		})();

		p.setup = () => {

			p.createCanvas(size.width, size.height);
			p.background(0);
			p.circle = new BezierCircle( p,
				{
					numPoints: 20,
					contraction_func: (i: number) => { return p.noise(i) * 1 }
				});

			p.circle.beforeCycleCallback = () => {
				p.beforeCycle(p);
			}

			p.setupDone(p);

		}

		p.draw = () => {

			p.fill(0, p.opacitySpeed);
			p.rect(0, 0, p.width, p.height);

			//p.fill(0, p.opacitySpeed);
			p.circle.refresh(p.frameCount);
			p.noFill();
			p.stroke(255);
			p.strokeWeight(1);
			p.circle.draw(p);

		}
	}
}

export const makeSketch = (containerId: string, setupDoneCallback: Function = null, beforeCycleCallback: Function = null) => {
	const container = document.getElementById(containerId);
	return new p5(sketch(setupDoneCallback, beforeCycleCallback), container);
}

