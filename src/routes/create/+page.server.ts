import type { PageServerLoad } from './$types';
import {fail,redirect, type Actions } from '@sveltejs/kit';
import type { IUser } from '$lib/interfaces';
import { writeFileSync } from 'fs';
import path from 'path'; 
import sharp from 'sharp';
import { PUBLIC_IMAGE_PATH } from '$env/static/public';
import { User } from '$lib/server/user';
import { Session } from '$lib/server/session';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {

    create: async({request, cookies}) => {
        const data = await request.formData();

        const name = (data.get('name')?? '').toString();
        const location = (data.get('location') ?? '').toString();
        const occupation = (data.get('occupation')??'').toString();
        const email = (data.get('email')??'').toString();
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

        const user:IUser = {
            name,
            location,
            occupation,
            email,
            id:0,
            avatar_path,
        }

        
        const readUser = await User().insert(user, password);
        if('error' in readUser){
            return fail(400, { message: readUser.error, status:false });
        }

        const session = await Session().insert(readUser.id);
        if('error' in session){
            return fail(400, { message: session.error, status:false });
        }

        //set cookies
        cookies.set(
            'basefoot',
            session.gui_id,{
                path:'/',
                maxAge:60*60*8
            }
        )
        redirect(303,'/');
    }

} satisfies Actions;

