<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Briefcase, Home } from "lucide-svelte";
  
        
  let menuOpen = $state(false);
  let { data } = $props();
       
  let backgroundImage = $derived(`/photos/${data.profile.id}`);
</script>

<Navbar {data} bind:menuOpen />

{#if !menuOpen}
<div class="mt-4 min-h-auto">
  <div class="flex gap-3 items-center">
        <Avatar.Root class="w-40 h-40">
            <Avatar.Image src={backgroundImage} alt="user upload photo" />
            <Avatar.Fallback>U</Avatar.Fallback>
        </Avatar.Root>
        <div>
            <div class="text-2xl font-bold mb-2">{data.profile.name}</div>
            <div class="flex gap-2 font-semibold">
                <Briefcase class="w-7 h-7" />
                {data.profile?.occupation}
            </div>
            <div class="flex gap-2 font-semibold">
                <Home class="w-7 h-7" />
                {data.profile?.location}
            </div>
        </div>
    </div>
    <div class="font-bold mt-6 text-lg">Friends</div>
    <div class="flex gap-2">
        {#each data.friends as friend}
            <a href="/profile/{friend.id}" class="basis-[calc(100%/4-6px)] shadow">
                <div class="w-full aspect-square bg-gray-400 flex bg-cover bg-center"
                        style="background-image: url('/photos/{friend.id}');">
                </div>
                <div class="h-8 text-blue-500">{friend.name}</div>
            </a>
        {/each}
        {#if data.friends?.length === 0}
            <div class="bg-gray-300 text-gray-600 p-4 w-full text-center">{data.profile.name} doesnt have any friends</div>
        {/if}
    </div>
    <div class="font-bold mt-6 text-lg">Posts</div>
        {#each data.posts as posts}
            <!-- 12:07-->
        {/each}
        {#if data.posts?.length === 0}
            <div class="bg-gray-300 text-gray-600 p-4 w-full text-center">{data.profile.name} no posts available</div>
        {/if}
</div>
{/if}