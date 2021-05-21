import gsap from 'gsap'

interface DrawCircleParams {
	center_x?: number;
	center_y?: number;
	radius?: number;
	steps?: number;
	func_x?: Function;
	func_y?: Function;
	debug?: boolean;
}

interface DrawBezierParams extends DrawCircleParams {
	center_x?: number;
	center_y?: number;
	radius?: number;
	steps?: number;
	func_x?: Function;
	func_y?: Function;
	cp_func_x?: Function;
	cp_func_y?: Function;
	contraction_func?: Function;
	anim_length?: number;
	debug?: boolean;
}

export class BezierCircle {

	p: any;

	debug: boolean;
	center_x: number;
	center_y: number;
	radius: number;
	steps: number;
	private _steps: number;
	numPoints: number;
	interval: number;

	func_x: Function;
	func_y: Function;

	cp_func_x: Function;
	cp_func_y: Function;

	points: Array<any>;

	private calc_x: Function;
	private calc_y: Function;

	private calc_cp_x: Function;
	private calc_cp_y: Function;

	anim_length: number;
	private anim_timer: number;

	contraction_func: Function;

	constructor(p: any, params: DrawBezierParams = {}) {

		this.p = p;

		this.center_x = params.center_x || p.width/2;
		this.center_y = params.center_y || p.height/2;
		this.radius = params.radius || p.width/4;
		this.steps = params.steps || 16;

		// Keep track of step changes.
		this._steps = this.steps;

		this.numPoints = this.steps / 2 + 1;
		this.interval = (Math.PI * 2) / this.steps;

		this.anim_length = params.anim_length || 60;

		this.debug = params.debug;

		this.points = new Array<any>(this.numPoints);

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

		// Populate points
		this.makePoints();
	}

	makePoints = () => {

		this.points[0] = { 
			index: 0, 
			x_pos: this.calc_x(0),
			y_pos: this.calc_y(0),
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
		};

		let calc_cp_x, calc_cp_y, calc_cp_x_next, calc_cp_y_next;

		for (let i = this.interval, z = 1; i < Math.PI * 2; i += this.interval * 2, z++) {

			calc_cp_x = this.calc_cp_x(i);
			calc_cp_y = this.calc_cp_y(i);
			
			this.p.noiseSeed(Math.random() * 1024);
			this.p.randomSeed(Math.random() * 1024);

			calc_cp_x_next = this.calc_cp_x(i);
			calc_cp_y_next = this.calc_cp_y(i);

			this.points[z] = {

				index: z,
				x_pos: this.calc_x(i + this.interval),
				y_pos: this.calc_y(i + this.interval),
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

			this.points[z].cp_tween = gsap.fromTo(
				this.points[z],
				{

					cp0x: this.points[z].cp0x_orig,
					cp0y: this.points[z].cp0y_orig,
					cp1x: this.points[z].cp1x_orig,
					cp1y: this.points[z].cp1y_orig,

				}, 
				{

					cp0x: this.points[z].cp0x_next,
					cp0y: this.points[z].cp0y_next,
					cp1x: this.points[z].cp1x_next,
					cp1y: this.points[z].cp1y_next,
					duration: 2,
					ease: "elastic"

				}
			);

			this.points[z].cp_tween.pause();
		}
	}

	refreshPoints = () => {

		if (this.steps != this._steps) {
			console.log("Steps changed");

			this.interval = (Math.PI * 2) / this.steps;
			this.numPoints = this.steps / 2 + 1;

			this._steps = this.steps;	

			this.makePoints();
		}

		let calc_cp_x, calc_cp_y;

		for (let i = this.interval, z = 1; i < Math.PI * 2; i += this.interval * 2, z++) {

			this.p.noiseSeed(Math.random() * 1024);
			this.p.randomSeed(Math.random() * 1024);

			calc_cp_x = this.calc_cp_x(i);
			calc_cp_y = this.calc_cp_y(i);

			this.points[z].cp0x_orig = this.points[z].cp0x_next;
			this.points[z].cp0y_orig = this.points[z].cp0y_next;

			this.points[z].cp0x = this.points[z].cp0x_next;
			this.points[z].cp0y = this.points[z].cp0y_next;

			this.points[z].cp0x_next = calc_cp_x;
			this.points[z].cp0y_next = calc_cp_y;

			this.points[z].cp1x_orig = this.points[z].cp1x_next;
			this.points[z].cp1y_orig = this.points[z].cp1y_next;

			this.points[z].cp1x = this.points[z].cp1x_next;
			this.points[z].cp1y = this.points[z].cp1y_next;

			this.points[z].cp1x_next = calc_cp_x;
			this.points[z].cp1y_next = calc_cp_y;

			this.points[z].cp_tween = gsap.fromTo(
				this.points[z],
				{
					cp0x: this.points[z].cp0x_orig,
					cp0y: this.points[z].cp0y_orig,
					cp1x: this.points[z].cp1x_orig,
					cp1y: this.points[z].cp1y_orig,
				}, 
				{
					cp0x: this.points[z].cp0x_next,
					cp0y: this.points[z].cp0y_next,
					cp1x: this.points[z].cp1x_next,
					cp1y: this.points[z].cp1y_next,
					duration: 2,
					ease: "elastic"
				}
			);

			this.points[z].cp_tween.pause();

		}

	}

	refresh = (timer: number) => {

		this.anim_timer = (timer % this.anim_length) / (this.anim_length - 1);

		for (let i = 1; i < this.numPoints; i++) {
			this.points[i].cp_tween.progress(this.anim_timer);
		}

		if (this.anim_timer == 0) {
			this.refreshPoints();
		}
	}

	draw = () => {
		
		const p = this.p;

		if (!this.hasPoints()) {
			this.makePoints();
		}

		p.beginShape();

		p.vertex(this.points[0].x_pos, this.points[0].y_pos);

		for (let i = 1; i < this.numPoints; i++) {

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

	private hasPoints = () => {
		return typeof this.points[0] == "object" && this.points[0].first == true;
	}

}

const setDefaultFunction = (paramToCheck: any, defaultFunction: Function) => {
	if (paramToCheck) { return paramToCheck }
	else { return defaultFunction }
}

export const drawCircle = (p: any, params: DrawCircleParams = {}) => {

	const center_x = params.center_x || p.width/2;
	const center_y = params.center_y || p.height/2;
	const radius = params.radius || p.width/4;
	const steps = params.steps || 16;
	const interval = (Math.PI * 2) / steps;
	
	const func_x = setDefaultFunction(params.func_x, (x: number) => Math.sin(x));
	const func_y = setDefaultFunction(params.func_y, (y: number) => Math.cos(y));

	p.beginShape();

	for (let i = 0; i < Math.PI * 2; i += interval) {
		const x_val = func_x(i) * radius + center_x;
		const y_val = func_y(i) * radius + center_y;
		p.vertex(x_val, y_val);
	}

	p.endShape();
}
