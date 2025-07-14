import type { PageServerLoad } from './$types';
import {fail,redirect, type Actions } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import sharp from 'sharp';
import { PUBLIC_IMAGE_PATH } from '$env/static/public';
import { User } from '$lib/server/user';

export const load = (async ({locals}) => {
    return {
        user:locals.user
    };
}) satisfies PageServerLoad;

export const actions = {

    update: async({request, cookies, locals}) => {
        const data = await request.formData();

        const name = (data.get('name')?? '').toString();
        const location = (data.get('location') ?? '').toString();
        const occupation = (data.get('occupation')??'').toString();
        const email = (data.get('email')??'').toString();
        
        //get existing user from the db
        const existingUser = await User().getSingle(locals.user.id);        
        if(!existingUser){
            throw new Error('Important information not found about user');
        }

        //get avatar path 
        const file = data.get('avatar') as File;
        let avatar_path = '';
        if(!file.name){
            avatar_path = existingUser.avatar_path;
        }else{
            const ext = file.name.split('.').pop();
            if(!ext || (ext.toLocaleLowerCase() !== 'jpeg' && ext.toLocaleLowerCase() !== 'jpg' 
                && ext.toLocaleLowerCase() !== 'png')){
                    fail(400,{message:'Image must be jpeg, jpg or png'})
                }
            const read = Math.floor(1000 + Math.random() * 9000);
            const file_name = file.name.replace('.'+ext,'')+'_'+read+'.'+ext;

            
            const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
            .resize({width:600})
            .toBuffer()
            .then(data => {
                return data
            });
            //save image to sevrer not static folder
            writeFileSync(PUBLIC_IMAGE_PATH+file_name, buffer);
            avatar_path = file_name;
        }

        existingUser.name = name;
        existingUser.email = email;
        existingUser.location = location;
        existingUser.occupation = occupation;
        existingUser.avatar_path = avatar_path;
        const readUser = await User().update(existingUser);
        if('error' in readUser){
            return fail(400, { message: readUser.error, status:false });
        }
        return{
             message: 'Information updated succesful', 
             status:true
        }
    }

} satisfies Actions;