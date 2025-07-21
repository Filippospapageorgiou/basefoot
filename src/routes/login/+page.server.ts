import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {fail, type Actions } from '@sveltejs/kit';
import { DB } from '$lib/common/database';
import { Session } from '$lib/server/session';

export const load = (async ({locals}) => {
    if(locals.user){
      throw redirect(303,'/');
    }
}) satisfies PageServerLoad;


export const actions = {
    login: async({request, cookies}) => {
        const data = await request.formData();

        const email = data.get('email');
        const password = data.get('password');


        if(!email || email.toString().trim() === '' ||
            !password || password.toString().trim() === ''){
                return fail(400,{message:"Please provide email and password"});
        }

        //create sql get user id back
        const sql = `
        select * from data.users
        where lower(email) = lower($1)
        and hash_password = crypt($2, hash_password)`

        const rows = await DB().qeuery(sql, [email,password]);
        if(!rows[0]){
            return fail(400,{message:"Your email or password is incorect"})
        }
        const user_id:number = rows[0].id;
        
        //create session
        const session = await Session().insert(user_id);
        if('error' in session){
            return fail(400,{message:session.error});
        }

        //set the cookies
        cookies.set('basefoot', session.gui_id, {
            path:'/',
            maxAge:60*60*8
        });

        redirect(303,'/')
    }
}