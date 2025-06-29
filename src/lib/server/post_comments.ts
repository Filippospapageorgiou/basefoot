import type { IPostComment, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const PostComment = () => {

    //validation comment helper method
    const checkRequireElements = (object: IPostComment): void | ValidationError => {
        if(object.text.trim() === ''){
            return {error:'Comment text is required'}
        }
        if(object.text.length > 1000){
            return {error:'Comment text cannot exceed 1000 characters'}
        }
        if(!object.user_id || object.user_id <= 0){
            return {error:'Valid user ID is required'}
        }
        if(!object.post_id || object.post_id <= 0){
            return {error:'Valid post ID is required'}
        }
    }

    const api = {
        generateObject:(row:any): IPostComment =>{
            const object:IPostComment = {
                id: row.id,
                user_id: row.user_id,
                post_id: row.post_id,
                created_at: row.created_at,
                text: row.text
            }
            return object;
        },

        //get all comments for a specific post
        getPostComments: async(post_id:number) : Promise<Array<IPostComment>> => {
            const results: IPostComment[] = [];
            const sql = `select * from data.post_comments where post_id = $1 order by created_at`;
            const response = await DB().qeuery(sql,[post_id])
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results
        },

        //get all comments by a user
        getUserComments: async(user_id:number): Promise<Array<IPostComment>> => {
            const results: IPostComment[] = [];
            const sql = `select * from data.post_comments where user_id = $1 order by created_at desc`;
            const response = await DB().qeuery(sql,[user_id]);
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results;
        },

        //get single comment by ID
        getSingle:async(id:number): Promise<IPostComment | void> => {
            const sql = `SELECT * FROM data.post_comments where id = $1`;
            const response = await DB().qeuery(sql,[id]);
            for(const row of response){
                const record = api.generateObject(row);
                return record;
            }
        },

        //get comments with user details
        getPostCommentsWithUser: async(post_id:number): Promise<Array<any>> => {
            const results: any[] = [];
            const sql = `
                select pc.*, u.name, u.email, u.avatar_path 
                from data.post_comments pc
                inner join data.users u on pc.user_id = u.id
                where pc.post_id = $1
                order by pc.created_at
            `;
            const response = await DB().qeuery(sql,[post_id]);
            for(const row of response){
                results.push({
                    id: row.id,
                    user_id: row.user_id,
                    post_id: row.post_id,
                    created_at: row.created_at,
                    text: row.text,
                    user_name: row.name,
                    user_email: row.email,
                    user_avatar: row.avatar_path
                });
            }
            return results;
        },

        //get comment count for a post
        getCommentCount: async(post_id:number): Promise<number> => {
            const sql = `select count(*) as count from data.post_comments where post_id = $1`;
            const response = await DB().qeuery(sql,[post_id]);
            return parseInt(response[0].count) || 0;
        },

        insert:async(object:IPostComment): Promise<IPostComment | ValidationError> => {
            const result = checkRequireElements(object);
            if(result){
                return result;
            }

            const sql = `
                insert into data.post_comments
                (user_id, post_id, text)
                values
                ($1, $2, $3)
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.user_id,
                object.post_id,
                object.text.trim()
            ]);

            if(!response[0]){
                throw new Error('unable to create comment record')
            }

            return api.generateObject(response[0]);
        },

        update:async(object:IPostComment): Promise<IPostComment | ValidationError> => {
            const result = checkRequireElements(object);
            if(result){
                return result;
            }

            const sql = `
                update data.post_comments set
                    text = $1
                where id = $2 and user_id = $3
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.text.trim(),
                object.id,
                object.user_id
            ]);

            if(!response[0]){
                throw new Error('unable to update comment record or permission denied')
            }

            return api.generateObject(response[0]);
        },

        //delete comment
        delete: async(id:number, user_id:number): Promise<boolean> => {
            const sql = `
                delete from data.post_comments 
                where id = $1 and user_id = $2
            `;
            const response = await DB().qeuery(sql,[id, user_id]);
            return response.length > 0;
        },

        //delete all comments from a post
        deleteAllPostComments: async(post_id:number): Promise<number> => {
            const sql = `delete from data.post_comments where post_id = $1`;
            const response = await DB().qeuery(sql,[post_id]);
            return response.length;
        },

        //delete all comments by a user
        deleteAllUserComments: async(user_id:number): Promise<number> => {
            const sql = `delete from data.post_comments where user_id = $1`;
            const response = await DB().qeuery(sql,[user_id]);
            return response.length;
        }
    }
    return api;
}