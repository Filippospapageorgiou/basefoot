import type { PageServerLoad } from './$types';
import {fail, type Actions } from '@sveltejs/kit';
import type { IUser } from '$lib/interfaces';
import sharp from 'sharp';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {

    create: async({request, cookies}) => {
        const data = await request.formData();

        const name = (data.get('name')?? '').toString();
        const location = (data.get('location') ?? '').toString();
        const occupation = (data.get('occupation')??'').toString();
        const email = (data.get('eamil')??'').toString();
        const password = (data.get('password')??'').toString();
        

        //get avatar path 
        const file = data.get('avatar') as File;
        let avatar_path = '';
        if(!file.name){
            fail(400,{message:'Please select a profile image'})
        }else{
            const ext = file.name.split('.').pop();
            if(!ext || (ext.toLocaleLowerCase() !== 'jpeg' && ext.toLocaleLowerCase() !== 'jpg' 
                && ext.toLocaleLowerCase() !== 'png')){
                    fail(400,{message:'Image must be jpeg, jpg or png'})
                }
            const read = Math.floor(1000 + Math.random() * 9000);
            const file_name = file.name.replace('.'+ext,'')+'_'+read+ext;

            //resize image
            //todo 22:54
            const buffer = await sharp
        }

        const user:IUser = {
            name,
            location,
            occupation,
            email,
            id:0,
            avatar_path:'',
            created_at: new Date(),
            updated_at: null
        }

    }

} satisfies Actions;
