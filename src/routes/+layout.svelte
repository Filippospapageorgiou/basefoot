<script lang="ts">
	import CustomAlert from '$lib/components/ui/customAlert.svelte';
import '../app.css';
	
	let { children } = $props();
</script>

<CustomAlert />
<div class="bg-[url('Gunmetal.jpeg')] h-svh w-full bg-cover bg-center flex items-center justify-center">
	<div class="bg-white w-full max-w-[600px] p-6 rounded-lg h-[calc(100svh-100px)]">
		{@render children()}
	</div>
</div>
