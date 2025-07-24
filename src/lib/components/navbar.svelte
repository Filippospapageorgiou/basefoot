<script lang="ts">
  import Input from "$lib/components/ui/input/input.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Search, Bell, LogOut, Lock } from "lucide-svelte";
  import { fly, slide } from "svelte/transition";
  import Icon from "$lib/components/ui/Icon.svelte";
  import { enhance } from "$app/forms";
  import { toast } from "$lib/stores/toast.svelte";
  
  
  let { form = null, data, menuOpen = $bindable(false) } = $props();
  

  $effect(() =>{
        if(form?.message){
            if(!form.status){
                toast.show = true;
                toast.status = false;
                toast.title = 'Error try again';
                toast.text = form.message;
            } else if(form.status) {
                // Force avatar refresh on successful update
                avatarKey = Date.now();
                toast.show = true;
                toast.status = true;
                toast.title = 'Success';
                toast.text = form.message;
            }
        }
    })
 
  let files: FileList | undefined = $state();
  let backgroundImage = $state("");
  let avatarKey = $state(Date.now()); // Force refresh key

  $effect(() => {
    if (files && files[0]) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        backgroundImage = reader.result?.toString() || "";
      });
      reader.readAsDataURL(files[0]);
    } else {
      backgroundImage = "";
    }
  });

  
  const toggleMenu = () => {
    menuOpen = !menuOpen;
  };

  let avatarUrl = $derived(`/photos/${data.user.id}?v=${avatarKey}`);
</script>

<div class="flex items-center justify-between w-full mb-6">
  <div class="relative flex flex-column w-full max-w-[300px]">
    <Avatar.Root class="w-10 h-10 pr-1 text-blue-500">
              <Avatar.Image src="/ahooks.svg" alt="logo" />
              <Avatar.Fallback>U</Avatar.Fallback>
            </Avatar.Root>
    <Input class="pr-10" name="search" placeholder="search basefoot..." />
    <Search
      class="absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400"
    />
  </div>
  <div class="flex items-center gap-2">
    <button
      class="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
    >
      <Bell class="w-5 h-5 text-gray-600" />
    </button>
    <button
      onclick={toggleMenu}
      class="rounded-full hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer"
    >
      <Avatar.Root class="w-12 h-12">
        <Avatar.Image src={avatarUrl} alt="user upload photo" />
        <Avatar.Fallback>U</Avatar.Fallback>
      </Avatar.Root>
    </button>
  </div>
</div>

{#if menuOpen}
<div
    class="right-6 left-6 bottom-6 top-22"
    in:fly={{ x: 200, duration: 700 }}
    out:fly={{ x: 200, duration: 700 }}
  >
    <div class="text-2xl font-semibold">Settings</div>
    <form
      action="?/update"
      method="post"
      use:enhance
      enctype="multipart/form-data"
    >
      <div class="flex flex-col justify-center p-8">
        <div class="flex flex-col items-center justify-center space-y-2 pb-4">
          <p class="text-xl font-semibold">Update your account info</p>
        </div>
        <div class="space-y-4 pb-4">
          <div class="relative max-full">
            <Input
              name="name"
              type="name"
              placeholder="Full name"
              class="pr-10"
              value = {data.user.name}
            />
          </div>
          <div class="flex gap-3">
            <Input
              class="basis-1/2"
              name="location"
              placeholder="City, State"
              value = {data.user.location}
            />
            <Input
              class="basis-1/2"
              name="occupation"
              placeholder="Occupation"
              value = {data.user.occupation}
            />
          </div>
          <div class="w-full">
            <Input
              class="basis-1/2"
              type="email"
              name="email"
              placeholder="email"
              value = {data.user.email}
            />
          </div>
          <div class="flex items-center gap-3">
            <Avatar.Root class="w-30 h-30">
              <Avatar.Image src={backgroundImage || avatarUrl} alt="user upload photo" />
              <Avatar.Fallback>U</Avatar.Fallback>
            </Avatar.Root>
            <input
              bind:files
              type="file"
              accept="image/png,image/jpeg"
              name="avatar"
              class="cursor-pointer text-sm"
            />
          </div>
        </div>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
    <a
      class="flex items-center gap-3 font-bold cursor-pointer p-2 rounded-lg
    hover:bg-gray-100 text-blue-400"
      href="/logout"
    >
      <Icon onclick={() => {}}>
        <LogOut />
      </Icon>
      Log out
    </a>
    <a
      class="flex items-center gap-3 font-bold cursor-pointer p-2 rounded-lg
    hover:bg-gray-100 text-blue-400"
      href="/change"
    >
      <Icon onclick={() => {}}>
        <Lock />
      </Icon>
      Change password
    </a>
  </div>
{/if}