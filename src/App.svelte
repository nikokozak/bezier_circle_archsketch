<script lang="ts">
	import { makeSketch } from './sketch.ts';
	
	let sketch = {opacitySpeed: 20};
	let circle = {numPoints: 0};

	makeSketch('p5',
	(p) => {circle = p.circle; sketch = p;},
	(p) => {p.fill(0); p.rect(0, 0, 500, 500);}
	);

	console.log(sketch);
</script>

<main>
	<div id="controls">
		<div>
			<label for="numVertices">Number of Vertices: {circle.numPoints}</label>
			<input id="numVertices" type="range" min=2 max=50 bind:value={circle.numPoints}/>
			<label for="scalar">Scalar Size: {circle.contraction_scalar}</label>
			<input id="scalar" type="range" min=0 max=6 step=0.1 bind:value={circle.contraction_scalar}/>
			<label for="radius">Radius: {circle.radius}</label>
			<input id="radius" type="range" min=10 max=250 step=1 bind:value={circle.radius}/>
		</div>
		<div>
			<label for="opacity">Traces Amt: {sketch.opacitySpeed}</label>
			<input id="opacity" type="range" min=1 max=125 step=1 bind:value={sketch.opacitySpeed}/>
			<label for="speed">Cycle Speed: {circle.anim_length}</label>
			<input id="speed" type="range" min=1 max=600 step=1 bind:value={circle.anim_length}/>
		</div>
	</div>
	<div id="p5"></div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	p {
		margin: 0;
	}

	#controls {
		display: flex;
		justify-content: space-between;
		max-width: 500px;
		margin: 0 auto;
	}

	#controls > div {
		width: 200px;
	}	

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
