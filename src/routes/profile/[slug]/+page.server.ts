import { error, fail } from '@sveltejs/kit';
import { User } from '$lib/server/user';
import { Friend } from '$lib/server/friends';
import type { PageServerLoad } from './$types';
import type { IPost } from '$lib/interfaces';

export const load = (async ({ locals, params }) => {
    
    const user_id = parseInt(params.slug, 10);
    
    
    if (isNaN(user_id) || user_id <= 0) {
        throw error(400, {
            message: "Invalid user ID provided",
        });
    }
    
    try {
        const profile = await User().getSingle(user_id);
        const friends = await User().getFriends(user_id);

        const posts: IPost[] = []; // todo get posts by user

        friends.slice(0,4);
        
        
        if (!profile) {
            throw error(404, {
                message: "Profile not found",
            });
        }

        return {
            user: locals.user,
            profile,
            friends,
            posts
        };
    } catch (err) {
        if (err instanceof Error && 'status' in err) {
            throw err;
        }
        throw error(500, {
            message: "Failed to load profile"
        });
    }
}) satisfies PageServerLoad;