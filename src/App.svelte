<script lang="ts">
	import { makeSketch } from './sketch.ts';
	
	let sketch;
	let steps;
	let circle = {steps: 0};

	sketch = makeSketch('p5',
	(p) => { steps = p.circle.steps; circle = p.circle; });

	console.log(sketch);
</script>

<main>
	<p>{ steps }</p>
	<input type="number" bind:value={circle.steps}/>
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
