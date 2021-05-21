import gsap from 'gsap'

interface DrawBezierParams {
	center_x?: number;
	center_y?: number;
	radius?: number;
	numPoints?: number;
	func_x?: Function;
	func_y?: Function;
	cp_func_x?: Function;
	cp_func_y?: Function;
	contraction_func?: Function;
	anim_length?: number;
	debug?: boolean;
}

export const BezierCircle = function(p5: any, params: DrawBezierParams)
{
	this.p = p5;
	this.center_x = params.center_x || this.p.width/2;
	this.center_y = params.center_y || this.p.height/2;
	this.radius = params.radius || this.p.width/4;

	// Keep track of step changes.

	this.numPoints = params.numPoints || 9; 
	this._numPoints = this.numPoints;

	this.interval = this._makeInterval(this.numPoints);

	this.anim_length = params.anim_length || 60;

	this.debug = params.debug;

	this.points = new Array<any>(50);

	this.func_x = setDefaultFunction(params.func_x, (x: number) => Math.sin(x));
	this.func_y = setDefaultFunction(params.func_y, (y: number) => Math.cos(y));

	this.cp_func_x = setDefaultFunction(params.cp_func_x, this.func_x);
	this.cp_func_y = setDefaultFunction(params.cp_func_y, this.func_y);

	this.contraction_func = setDefaultFunction(params.contraction_func, (i: number) => 1);

	this.calc_x = (i: number) => this.func_x(i) * this.radius + this.center_x;
	this.calc_y = (i: number) => this.func_y(i) * this.radius + this.center_y;

	this.calc_cp_x = (i: number) => this.cp_func_x(i) * this.radius * this.contraction_func(i) + this.center_x;
	this.calc_cp_y = (i: number) => this.cp_func_y(i) * this.radius * this.contraction_func(i) + this.center_y;

	this.anim_timer = 0;

	this.makePoints();
}

BezierCircle.prototype.makePoints = function() 
{
		this.points[0] = this._makeNullVertex();

		for (let z = 1; z <= this.numPoints; z++) {

			const i = this.interval + (this.interval * 2 * (z - 1));

			this.points[z] = this._makeBezierVertex(z, i);

			this.points[z].cp_tween = this._makeCPTween(this.points[z]);
			this.points[z].cp_tween.pause();
		}
}

BezierCircle.prototype._makeInterval = function(numPoints: number)
{
	return (Math.PI * 2) / (numPoints * 2);
}

BezierCircle.prototype._makeNullVertex = function(base: number = 0)
{
	return {
		index: 0, 
		x_pos: this.calc_x(base),
		y_pos: this.calc_y(base),
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
	const calc_cp_x = this.calc_cp_x(currentInterval);
	const calc_cp_y = this.calc_cp_y(currentInterval);

	this.p.noiseSeed(Math.random() * 1024);
	this.p.randomSeed(Math.random() * 1024);

	const calc_cp_x_next = this.calc_cp_x(currentInterval);
	const calc_cp_y_next = this.calc_cp_y(currentInterval);

	return {
			index: index,
			x_pos: this.calc_x(currentInterval + this.interval),
			y_pos: this.calc_y(currentInterval + this.interval),
			first: false,

			cp0x_orig: calc_cp_x,
			cp0y_orig: calc_cp_y,
			cp0x: calc_cp_x,
			cp0y: calc_cp_y,
			cp0x_next: calc_cp_x_next,
			cp0y_next: calc_cp_y_next,

			cp1x_orig: calc_cp_x,
			cp1y_orig: calc_cp_y,
			cp1x: calc_cp_x,
			cp1y: calc_cp_y,
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

		const calc_cp_x = this.calc_cp_x(currentInterval);
		const calc_cp_y = this.calc_cp_y(currentInterval);

		bezierVertex.cp0x_orig = bezierVertex.cp0x_next;
		bezierVertex.cp0y_orig = bezierVertex.cp0y_next;

		bezierVertex.cp0x = bezierVertex.cp0x_next;
		bezierVertex.cp0y = bezierVertex.cp0y_next;

		bezierVertex.cp0x_next = calc_cp_x;
		bezierVertex.cp0y_next = calc_cp_y;

		bezierVertex.cp1x_orig = bezierVertex.cp1x_next;
		bezierVertex.cp1y_orig = bezierVertex.cp1y_next;

		bezierVertex.cp1x = bezierVertex.cp1x_next;
		bezierVertex.cp1y = bezierVertex.cp1y_next;

		bezierVertex.cp1x_next = calc_cp_x;
		bezierVertex.cp1y_next = calc_cp_y;
}

BezierCircle.prototype._refreshPoints = function()
{
	if (this.numPoints != this._numPoints) {
		console.log("Steps changed");

		this.interval = this._makeInterval(this.numPoints);
		this._numPoints = this.numPoints;

		this.makePoints();
	}

	for (let z = 1; z <= this.numPoints; z++) {

		const i = this.interval + (this.interval * 2 * (z - 1));

		this._setNewBezierVertexState(this.points[z], i);

		this.points[z].cp_tween = this._makeCPTween(this.points[z]);
		this.points[z].cp_tween.pause();
	}
}

BezierCircle.prototype.refresh = function(timer: number)
{
	this.anim_timer = (timer % this.anim_length) / (this.anim_length - 1);

	if (this.anim_timer == 0 || this.numPoints != this._numPoints) {
		this._refreshPoints();
	}

	for (let i = 1; i <= this.numPoints; i++) {
		this.points[i].cp_tween.progress(this.anim_timer);
	}
}

BezierCircle.prototype.draw = function()
{
	const p = this.p;

	if (!this.hasPoints()) {
		this.makePoints();
	}

	p.beginShape();

	p.vertex(this.points[0].x_pos, this.points[0].y_pos);

	for (let i = 1; i <= this._numPoints; i++) {

		p.bezierVertex(
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

	p.endShape();
}

BezierCircle.prototype.hasPoints = function() {
		return typeof this.points[0] == "object" && this.points[0].first == true;
}

const setDefaultFunction = (paramToCheck: any, defaultFunction: Function) => {
	if (paramToCheck) { return paramToCheck }
	else { return defaultFunction }
}

