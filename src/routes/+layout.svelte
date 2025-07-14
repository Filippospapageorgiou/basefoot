<!-- layout.svelte -->
<script lang="ts">
	import CustomAlert from '$lib/components/ui/customAlert.svelte';
	import { page } from '$app/state';
	import '../app.css';
	
	let { children } = $props();
</script>

<CustomAlert />
<div class="bg-[url('Gunmetal.jpeg')] h-svh w-full bg-cover bg-center flex items-center justify-center">
	<div class="w-full max-w-[700px]">
		<div class="text-primary text-4xl font-bold h-[60px] flex items-center">
    	basefoot
		</div>
		<!--fill hieght if new feed url-->
		<div class="bg-white w-full p-6 rounded-lg {page.url.pathname === '/' ?'h-[calc(100svh-160px)]'
		:'max-h-[calc(100svh-160px)]'} relative overflow-hidden">
			{@render children()}
		</div>
	</div>
</div>