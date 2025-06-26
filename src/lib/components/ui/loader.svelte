<script lang="ts">
    import { loader } from "$lib/stores/loader.svelte";
</script>

{#if loader.show}
    <div class="
        loader
        flex
        flex-col
        justify-center
        fixed
        top-0
        w-full
        min-h-screen
        opacity-50
        align-middle: z-[51]
        bg-zinc-500">
        <div class="text-center">
            <div role="status">
                <div class="loader border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin
                    aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                <span class="sr-onky">Loading...</span>
            </div>
        </div>
        <div class="text-1xl animate-pulse text-center text-zinc-200">Loading...</div>
    </div>
{/if}