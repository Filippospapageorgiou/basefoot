<script lang="ts">
    import Navbar from "$lib/components/navbar.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { enhance } from "$app/forms";
    import { toast } from "$lib/stores/toast.svelte";

    let {form} = $props();

    let files:FileList | undefined = $state();
    let backgorundImage = $state('');
    $effect(() => {
        if(files && files[0]){
            const reader = new FileReader();
            reader.addEventListener('load', ()=>{
                backgorundImage = reader.result?.toString() || '';
            })
            reader.readAsDataURL(files[0])
        }else{
            backgorundImage = '';
        }
    })

    $effect(() =>{
        if(form?.message){
            if(!form.status){
                toast.show = true;
                toast.status = false;
                toast.title = 'Error try again';
                toast.text = form.message;
            }
        }
    })

</script>

<form action="?/create" method="post" use:enhance enctype="multipart/form-data">
    <div class="flex flex-col justify-center p-8">
    <div class="flex flex-col items-center justify-center space-y-2 pb-4">
        <p class=" text-2xl text-primary">Welcome to basefoot</p>
        <p>Create an account and connect with other people</p>
    </div>
    <div class="space-y-4 pb-4">
        <div class="relative max-full">
            <Input 
                name="name" 
                type="name" 
                placeholder="Full name" 
                class="pr-10" 
            />
        </div>
        <div class="flex gap-3">
            <Input class="basis-1/2" name="location" placeholder="City, State" />
            <Input class="basis-1/2" name="occupation" placeholder="Occupation" />
        </div>
        <div class="flex gap-3">
            <Input class="basis-1/2" type="email" name="email" placeholder="email" />
            <Input class="basis-1/2" type="password" name="password" placeholder="create password" />
        </div>
        <div class="flex items-center gap-3">
            <Avatar.Root class="w-30 h-30">
                <Avatar.Image src={backgorundImage} alt="user upload photo" />
                <Avatar.Fallback>U</Avatar.Fallback>
            </Avatar.Root>
            <input bind:files type="file" accept="image/png:image/jpeg" name="avatar" class="cursor-pointer text-sm" />
        </div>
    </div>
    <Button type="submit">Sign up</Button>
    <div class="flex items-center gap-2 justify-center pt-4 text-gray-600">
        <a class="text-primary" href="/login">Already have an account?</a>
    </div>
</div>
</form>

<style>
    input[type="file"]::file-selector-button {
        background-color: #99a1af;
        color:white;
        border-radius: 4px;
        cursor: pointer;
        padding: 3px;
    }
    input[type="file"]::file-selector-button:hover{
        background-color: #5f636b;
    }
</style>