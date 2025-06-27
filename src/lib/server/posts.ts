import type { IPost,ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const Post = () => {

    const api = {
        generateObject:(row:any): IPost =>{
            const object:IPost = {
                id:row.id,
                user_id:row.user_id,
                text:row.text,
                created:row.created,
                visibility:row.visibility
            }
            return object;
        },

        //get all posts for a single user
        getUserPosts: async(user_id:number) : Promise<Array<IPost>> => {
            const results: IPost[] = [];
            const sql = `select * from data.posts where user_id = $1 order by created`;
            const response = await DB().qeuery(sql,[user_id])
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results
        },

        //get all posts for a users friend
        getFriendsPost: async(user_id:number): Promise<Array<IPost>> => {
            const result: IPost[] = []
            // todo test this later
            const sql = `
                select distinct posts.*
                from data.posts
                inner join data.posts on friends_id = data.posts.user_id
                where friends.user_id = $1
                order by created
            `;
            const response = await DB().qeuery(sql,[user_id]);
            for(const row of response){
                const record = api.generateObject(row);
                result.push(record);
            }
            return result;
        },

        // Get a single post by ID
        getById: async (id: number): Promise<IPost | null> => {
            const sql = `SELECT * FROM data.posts WHERE id = $1`;
            try {
                const response = await DB().qeuery(sql, [id]);
                if (response) {
                    return api.generateObject(response[0]);
                }
                return null;
            } catch (error) {
                console.error('Error fetching post by id:', error);
                return null;
            }
        },

        // INSERT - Create new post
        insert: async (object:IPost): Promise<IPost> => {
            
            const sql = `
                INSERT INTO data.posts (user_id, text, visibility)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            
            const response = await DB().qeuery(sql, [
                object.user_id,
                object.text,
                object.visibility
            ]);

            if(!response[0]){
                throw new Error('Unable to create record');
            }

            return api.generateObject(response[0]);
                
        },

        // UPDATE - Update existing post
        update: async (object: IPost): Promise<IPost> => {
            const existingPost = await api.getById(object.id);
            if (!existingPost) {
                throw new Error('Post not found');
            }

            const sql = `
                UPDATE data.posts 
                SET text = $1, visibility = $2
                WHERE id = $3 AND user_id = $4
                RETURNING *
            `;
            
            const values = [
                object.text.trim(),
                object.visibility,
                object.id,
                object.user_id 
            ];
            
            try {
                const response = await DB().qeuery(sql, values);
                if (!response[0]) {
                    throw new Error('Post not found or permission denied');
                }
                
                const updatedPost = api.generateObject(response[0]);
                return updatedPost;
            } catch (error) {
                console.error('Error updating post:', error);
                throw new Error('Failed to update post');
            }
        },

        // DELETE - Delete post by ID
        delete: async (id: number, user_id: number): Promise<boolean> => {
            const existingPost = await api.getById(id);
            if (!existingPost) {
                throw new Error('Post not found');
            }
            
            if (existingPost.user_id !== user_id) {
                throw new Error('Permission denied: You can only delete your own posts');
            }

            const sql = `
                DELETE FROM data.posts 
                WHERE id = $1 AND user_id = $2
            `;
            
            try {
                const response = await DB().qeuery(sql, [id, user_id]);
                return response[0] > 0
            } catch (error) {
                console.error('Error deleting post:', error);
                throw new Error('Failed to delete post');
            }
        },
    }
    return api;
}