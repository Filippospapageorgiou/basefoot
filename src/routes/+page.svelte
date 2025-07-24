<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import { fly } from "svelte/transition";

  let { data } = $props();
  let menuOpen = $state(false);
</script>

<Navbar {data} bind:menuOpen />

{#if !menuOpen}
<div
    class="absolute right-6 left-6 bottom-6 top-22"
    out:fly={{ x: 200, duration: 700 }}
    in:fly={{ x: 200, duration: 700 }}
  >
    <div class="text-2xl font-semibold">News feed..</div>
</div>
{/if}