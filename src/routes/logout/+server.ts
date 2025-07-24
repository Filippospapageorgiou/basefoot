import type { RequestHandler } from './$types';
import { DB } from '$lib/common/database';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({cookies}) => {
    const session = cookies.get('basefoot');
    if(session){
        const sql = `update data.sessions set expires = now()
        where gui_id = $1`;
        await DB().qeuery(sql,[session])
    }

    cookies.delete('basefoot', {
        path:'/',
        maxAge:60*60*8
    });

    throw redirect(303,'/login')
};