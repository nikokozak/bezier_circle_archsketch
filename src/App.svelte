<script lang="ts">
	import { makeSketch } from './sketch.ts';
	
	let sketch;
	let numPoints;
	let circle = {numPoints: 0};

	sketch = makeSketch('p5',
	(p) => { numPoints = p.circle.numPoints; circle = p.circle; });

	console.log(sketch);
</script>

<main>
	<p>{ numPoints }</p>
	<input type="number" bind:value={circle.numPoints}/>
	<div id="p5"></div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
