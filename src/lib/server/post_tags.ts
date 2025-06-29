import type { IPostTag, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const PostTag = () => {

    const api = {
        generateObject:(row:any): IPostTag =>{
            const object:IPostTag = {
                post_id: row.post_id,
                user_id: row.user_id
            }
            return object;
        },

        //get all tags for a specific post
        getPostTags: async(post_id:number) : Promise<Array<IPostTag>> => {
            const results: IPostTag[] = [];
            const sql = `select * from data.post_tags where post_id = $1`;
            const response = await DB().qeuery(sql,[post_id])
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results
        },

        //get all posts where a user is tagged
        getUserTags: async(user_id:number): Promise<Array<IPostTag>> => {
            const results: IPostTag[] = [];
            const sql = `select * from data.post_tags where user_id = $1`;
            const response = await DB().qeuery(sql,[user_id]);
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results;
        },

        //check if user is already tagged in post
        checkIfTagged: async(post_id:number, user_id:number): Promise<boolean> => {
            const sql = `select * from data.post_tags where post_id = $1 and user_id = $2`;
            const response = await DB().qeuery(sql,[post_id, user_id]);
            return response.length > 0;
        },

        //get all users tagged in a post with user details
        getTaggedUsersInPost: async(post_id:number): Promise<Array<any>> => {
            const results: any[] = [];
            const sql = `
                select pt.*, u.name, u.email, u.avatar_path 
                from data.post_tags pt
                inner join data.users u on pt.user_id = u.id
                where pt.post_id = $1
                order by u.name
            `;
            const response = await DB().qeuery(sql,[post_id]);
            for(const row of response){
                results.push({
                    post_id: row.post_id,
                    user_id: row.user_id,
                    name: row.name,
                    email: row.email,
                    avatar_path: row.avatar_path
                });
            }
            return results;
        },

        insert:async(object:IPostTag): Promise<IPostTag | ValidationError> => {
            //check if already tagged
            const alreadyTagged = await api.checkIfTagged(object.post_id, object.user_id);
            if(alreadyTagged){
                return {error:'User is already tagged in this post'};
            }

            const sql = `
                insert into data.post_tags
                (post_id, user_id)
                values
                ($1, $2)
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.post_id,
                object.user_id
            ]);

            if(!response[0]){
                throw new Error('unable to create tag record')
            }

            return api.generateObject(response[0]);
        },

        //remove tag
        delete: async(post_id:number, user_id:number): Promise<boolean> => {
            const sql = `
                delete from data.post_tags 
                where post_id = $1 and user_id = $2
            `;
            const response = await DB().qeuery(sql,[post_id, user_id]);
            return response.length > 0;
        },

        //remove all tags from a post
        deleteAllPostTags: async(post_id:number): Promise<number> => {
            const sql = `delete from data.post_tags where post_id = $1`;
            const response = await DB().qeuery(sql,[post_id]);
            return response.length;
        },

        //remove all tags for a user (when user is deleted)
        deleteAllUserTags: async(user_id:number): Promise<number> => {
            const sql = `delete from data.post_tags where user_id = $1`;
            const response = await DB().qeuery(sql,[user_id]);
            return response.length;
        }
    }
    return api;
}