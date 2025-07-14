import { Session } from "$lib/server/session";
import { User } from "$lib/server/user";
import { redirect } from "@sveltejs/kit";

export async function handle({event, resolve}) {

    const gui_id = event.cookies.get('basefoot');
    if(gui_id){
        const session = await Session().getSingle(gui_id);
        if(session){
            const user = await User().getSingle(session.user_id);
            if(user){
                event.locals.user = user;
            }
        }
    }

    if(
        event.url.pathname !== '/login' &&
        event.url.pathname !== '/create' &&
        event.url.pathname !== '/forgot' &&
        event.url.pathname !== '/change' &&
        !event.locals.user
    ){
        //user is not signed in and trying to reach news feed
        throw redirect(303,'/login');
    }

    return await resolve(event);   
}