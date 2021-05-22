import p5 from 'p5'
import {BezierCircle} from './circle'

// -------------- SETUP ---------------- //

const size = {
	width: 500,
	height: 500
}

const sketch = (setupDoneCallback: Function) => {
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

		p.setup = () => {

			//p.rectMode(p.CORNER);

			p.createCanvas(size.width, size.height);
			p.background(0);
			p.circle = new BezierCircle( p,
				{
					numPoints: 20,
					contraction_func: (i: number) => { return p.noise(i) * 1 }
				});

			p.setupDone(p);

		}

		p.draw = () => {

			//p.fader.beginDraw();
			//p.fill(0, p.opacitySpeed);
			p.circle.refresh(p.frameCount);
			p.noFill();
			p.stroke(255);
			p.strokeWeight(1);
			p.circle.draw(p);

			p.fill(0, p.opacitySpeed);
			p.rect(0, 0, p.width, p.height);

		}
	}
}

export const makeSketch = (containerId: string, setupDoneCallback: Function = null) => {
	const container = document.getElementById(containerId);
	return new p5(sketch(setupDoneCallback), container);
}

