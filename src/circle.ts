import { setDefaultFunction } from './utils.ts'
import gsap from 'gsap'

interface DrawBezierParams {

	centerX?: number;
	centerY?: number;
	radius?: number;
	vertices?: number;
	funcX?: Function;
	funcY?: Function;
	cpFuncX?: Function;
	cpFuncY?: Function;
	contractionFunc?: Function;
  contractionSize?: number;
	cycleSpeed?: number;
	debug?: boolean;

}

const populateDefaultFields = (circle: any, params: DrawBezierParams) => {

	circle.centerX = params.centerX || circle.p.width/2;
	circle.centerY = params.centerY || circle.p.height/2;

	circle.radius = params.radius || circle.p.width/4;
	circle._radius = circle.radius;

	// Number of Vertices and change tracking store
	circle.vertices = params.vertices || 9;
	circle._vertices = circle.vertices;

	// Rotation interval for drawing CP's
	circle.interval = circle._makeInterval(circle.vertices);

	// Cycle for change of animation state
	circle.cycleSpeed = params.cycleSpeed || 60;

	circle.debug = params.debug;

	// Holds vertices
	circle.points = new Array<any>(50);

	// Defines how vertices are drawn in world
	circle.funcX = setDefaultFunction(params.funcX, (x: number) => Math.sin(x));
	circle.funcY = setDefaultFunction(params.funcY, (y: number) => Math.cos(y));

	// Defines how CP's are drawn in world
	circle.cpFuncX = setDefaultFunction(params.cpFuncX, circle.funcX);
	circle.cpFuncY = setDefaultFunction(params.cpFuncY, circle.funcY);

	// A scalar function for controlling CP position.
	circle.contractionFunc = setDefaultFunction(params.contractionFunc, (i: number) => 1);

	// A scalar for the scalar function.
	circle.contractionSize = params.contractionSize || 1;

	// Utility for vertex position.
	circle.calcX = (i: number) => circle.funcX(i) * circle.radius + circle.centerX;
	circle.calcY = (i: number) => circle.funcY(i) * circle.radius + circle.centerY;

	// Utility for CP position.
	circle.calcCPX = (i: number) =>
		circle.cpFuncX(i) * circle.radius * (circle.contractionFunc(i) * circle.contractionSize) + circle.centerX;
	circle.calcCPY = (i: number) =>
		circle.cpFuncY(i) * circle.radius * (circle.contractionFunc(i) * circle.contractionSize) + circle.centerY;

	// Internal clock util.
	circle.animTimer = 0;
}

export const BezierCircle = function(p5: any, params: DrawBezierParams)
{
	// The P5 instance
	this.p = p5;

  populateDefaultFields(this, params);

	this.makePoints();
}

BezierCircle.prototype.makePoints = function()
{
	// First shape vertex is "null".
	this.points[0] = this._makeNullVertex();

	for (let z = 1; z <= this.vertices; z++) {

		const i = this.interval + (this.interval * 2 * (z - 1));

		this.points[z] = this._makeBezierVertex(z, i);

		this.points[z].cp_tween = this._makeCPTween(this.points[z]);
		this.points[z].cp_tween.pause();

	}
}

BezierCircle.prototype.refresh = function(timer: number)
{
  // Calculate current moment in loop from 0.0 - 1.0
	this.animTimer = (timer % this.cycleSpeed) / (this.cycleSpeed - 1);

  // At end of lifecycle
  if (this.animTimer == 1) {
		this.beforeCycle();
  }

  // At first count of licycle.
	if (this.animTimer == 0 || this.vertices != this._vertices || this.radius != this._radius) {
		this._refreshPoints();
	}

	for (let i = 1; i <= this.vertices; i++) {
		this.points[i].cp_tween.progress(this.animTimer);
	}
}

BezierCircle.prototype.draw = function(graphics: any)
{
	const p = this.p;

	if (!this.hasPoints()) {
		this.makePoints();
	}

	graphics.beginShape();

	graphics.vertex(this.points[0].x_pos, this.points[0].y_pos);

	for (let i = 1; i <= this._vertices; i++) {

		graphics.bezierVertex(
			this.points[i].cp0x,
			this.points[i].cp0y,
			this.points[i].cp1x,
			this.points[i].cp1y,
			this.points[i].x_pos,
			this.points[i].y_pos
		);

		if (this.debug)
		{
			p.stroke(255, 0, 0);
			p.strokeWeight(1);
			p.ellipse( this.points[i].cp0x, this.points[i].cp0y, 5);
			p.noStroke();
		}
	}

	graphics.endShape();
}

BezierCircle.prototype.beforeCycle = function()
{
	return null;
}

BezierCircle.prototype._makeInterval = function(vertices: number)
{
	return (Math.PI * 2) / (vertices * 2);
}

BezierCircle.prototype._makeNullVertex = function(base: number = 0)
{
	return {
		index: 0,
		x_pos: this.calcX(base),
		y_pos: this.calcY(base),
		first: true,

		cp0x_orig: null,
		cp0y_orig: null,
		cp0x: null,
		cp0y: null,
		cp0x_next: null,
		cp0y_next: null,

		cp1x_orig: null,
		cp1y_orig: null,
		cp1x: null,
		cp1y: null,
		cp1x_next: null,
		cp1y_next: null,
	}
}

BezierCircle.prototype._makeBezierVertex = function(index: number, currentInterval: number)
{
	const calcCPX = this.calcCPX(currentInterval);
	const calcCPY = this.calcCPY(currentInterval);

  // Change seeds for next value generation.
	this.p.noiseSeed(Math.random() * 1024);
	this.p.randomSeed(Math.random() * 1024);

	const calc_cp_x_next = this.calcCPX(currentInterval);
	const calc_cp_y_next = this.calcCPY(currentInterval);

	return {
			index: index,
			x_pos: this.calcX(currentInterval + this.interval),
			y_pos: this.calcY(currentInterval + this.interval),
			first: false,

			cp0x_orig: calcCPX,
			cp0y_orig: calcCPY,
			cp0x: calcCPX,
			cp0y: calcCPY,
			cp0x_next: calc_cp_x_next,
			cp0y_next: calc_cp_y_next,

			cp1x_orig: calcCPX,
			cp1y_orig: calcCPY,
			cp1x: calcCPX,
			cp1y: calcCPY,
			cp1x_next: calc_cp_x_next,
			cp1y_next: calc_cp_y_next,
			}
}

BezierCircle.prototype._makeCPTween = function(bezierVertex: any, duration: number = 2, type: string = 'elastic')
{
		return gsap.fromTo(
			bezierVertex,
			{

				cp0x: bezierVertex.cp0x_orig,
				cp0y: bezierVertex.cp0y_orig,
				cp1x: bezierVertex.cp1x_orig,
				cp1y: bezierVertex.cp1y_orig,

			},
			{

				cp0x: bezierVertex.cp0x_next,
				cp0y: bezierVertex.cp0y_next,
				cp1x: bezierVertex.cp1x_next,
				cp1y: bezierVertex.cp1y_next,
				duration: duration,
				ease: type

			}
		);
}

BezierCircle.prototype._setNewBezierVertexState = function(bezierVertex: any, currentInterval: number)
{
		this.p.noiseSeed(Math.random() * 1024);
		this.p.randomSeed(Math.random() * 1024);

		const calcCPX = this.calcCPX(currentInterval);
		const calcCPY = this.calcCPY(currentInterval);

		bezierVertex.cp0x_orig = bezierVertex.cp0x_next;
		bezierVertex.cp0y_orig = bezierVertex.cp0y_next;

		bezierVertex.cp0x = bezierVertex.cp0x_next;
		bezierVertex.cp0y = bezierVertex.cp0y_next;

		bezierVertex.cp0x_next = calcCPX;
		bezierVertex.cp0y_next = calcCPY;

		bezierVertex.cp1x_orig = bezierVertex.cp1x_next;
		bezierVertex.cp1y_orig = bezierVertex.cp1y_next;

		bezierVertex.cp1x = bezierVertex.cp1x_next;
		bezierVertex.cp1y = bezierVertex.cp1y_next;

		bezierVertex.cp1x_next = calcCPX;
		bezierVertex.cp1y_next = calcCPY;
}

BezierCircle.prototype._refreshPoints = function()
{
	if (this.vertices != this._vertices || this.radius != this._radius) {
		console.log("Steps changed");

		this.interval = this._makeInterval(this.vertices);
		this._vertices = this.vertices;
		this._radius = this.radius;

		this.makePoints();
	}

	for (let z = 1; z <= this.vertices; z++) {

		const i = this.interval + (this.interval * 2 * (z - 1));

		this._setNewBezierVertexState(this.points[z], i);

		this.points[z].cp_tween = this._makeCPTween(this.points[z]);
		this.points[z].cp_tween.pause();
	}
}

BezierCircle.prototype.hasPoints = function()
{
		return typeof this.points[0] == "object" && this.points[0].first == true;
}
