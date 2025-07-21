<script lang="ts">
  import { enhance } from "$app/forms";
  import Navbar from "$lib/components/navbar.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
  import Input from "$lib/components/ui/input/input.svelte";

  let email: string = $state("");
  let password: string = $state("");
</script>

<Navbar />
<form action="?/login" method="post" use:enhance>
  <div class="flex flex-col justify-center p-8">
    <div class="flex flex-col items-center justify-center space-y-2 pb-4">
      <p class=" text-2xl text-primary">Welcome to basefoot</p>
      <p>Welcome back</p>
    </div>
    <div class="space-y-4 pb-4">
      <div class="relative max-full">
        <Input
          name="email"
          type="email"
          placeholder="email"
          class="pr-10"
          bind:value={email}
        />
        <div
          class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-400"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      <div class="relative max-full">
        <Input
          name="password"
          type="password"
          placeholder="password"
          class="pr-10"
          bind:value={password}
        />
        <div
          class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-400"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg
          >
        </div>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Checkbox />
        <p>Remember me</p>
      </div>
    </div>
    <Button type="submit" class="cursor-pointer">Login</Button>
    <div class="flex items-center gap-2 justify-center pt-4 text-gray-600">
      <a class="text-primary" href="/forgot">forgot password?</a> |
      <a class="text-primary" href="/create">create an account</a>
    </div>
  </div>
</form>
