<script lang="ts">
    let {children, onclick} = $props()
</script>


<button type="button" {onclick} class="w-10 h-10 rounded-[44px] bg-gray-200 flex items-center justify-content-center justify-center">
    {@render children()}
</button>