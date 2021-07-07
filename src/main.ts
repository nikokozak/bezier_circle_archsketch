import App from './App.svelte';

const app = new App({
	target: document.getElementById("svelte"),
	props: {
		name: 'world'
	}
});

export default app;
