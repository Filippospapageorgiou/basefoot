<script lang="ts">
    import { loader } from "$lib/stores/loader.svelte";
    import { fade } from "svelte/transition";
</script>

{#if loader.show}
    <div 
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[51] flex items-center justify-center"
        transition:fade={{ duration: 200 }}
    >
        <!-- Modern spinner -->
        <div class="relative">
            <!-- Outer ring -->
            <div class="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-primary"></div>
            <!-- Inner pulsing dot -->
            <div class="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        </div>
        
        <!-- Screen reader only text -->
        <span class="sr-only">Loading...</span>
    </div>
{/if}

<style>
    /* Custom animation for smoother spin */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>