<script lang="ts">
	import { makeSketch } from './sketch.ts';

  // Global check for P5 sketch load.
  let loaded = false;

  // Dummy values to stop reactive errors before p5 loads.
	let sketch = {opacitySpeed: 20, paused: false};
	let circle = {numPoints: 0};

  // Does sketch pause at the end of each cycle.
  let paused = false;

  const backgroundColor = 40;

  const sketchDefaults = {
    backgroundColor,
    width: 500,
    height: 500,
    cycleSpeed: 100,
    contractionSize: 2,

    setupDone: (p5instance) => {
      loaded = true;
      circle = p5instance.circle;
      sketch = p5instance;
    },

    beforeCycle: (p5instance) => {
      if (!paused) {
        p5instance.fill(backgroundColor);
        p5instance.rect(0, 0, 500, 500);
      } else {
        sketch.noLoop();
      }
    }
  }

	makeSketch(
    'p5',
    sketchDefaults
  );

  function pauseSketch()
  {
    if (paused) { sketch.loop() }
    paused = !paused;
  }

	console.log(sketch);
</script>

<main>
	<div id="controls">
		<div>
			<label for="numVertices">Number of Vertices: {circle.vertices}</label>
			<input id="numVertices" type="range" min=2 max=50 bind:value={circle.vertices} disabled={!loaded} />
		</div>
		<div>
			<label for="scalar">Scalar Size: {circle.contractionSize}</label>
			<input id="scalar" type="range" min=0 max=6 step=0.1 bind:value={circle.contractionSize} disabled={!loaded} />
		</div>
		<div>
			<label for="radius">Radius: {circle.radius}</label>
			<input id="radius" type="range" min=10 max=250 step=1 bind:value={circle.radius} disabled={!loaded} />
		</div>
		<div>
			<label for="opacity">Traces Amt: {sketch.traces}</label>
			<input id="opacity" type="range" min=0.1 max=20 step=0.1 bind:value={sketch.traces} disabled={!loaded} />
		</div>
		<div>
			<label for="speed">Cycle Speed: {circle.cycleSpeed}</label>
			<input id="speed" type="range" min=1 max=600 step=1 bind:value={circle.cycleSpeed} disabled={!loaded} />
		</div>
		<div>
			<button id="pause" on:click={pauseSketch}>Toggle Pause {paused ? "||" : ">"}</button>
		</div>
	</div>
	<div id="p5"></div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
	}

	p {
		margin: 0;
	}

	#controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		width: 400px;
		margin-bottom: 1rem;
	}

	#controls > div {
		width: 200px;
		margin-top: 1rem;
	}
</style>
