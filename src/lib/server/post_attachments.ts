import type { IPostAttachment, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const PostAttachment = () => {

    //validation attachment helper method
    const checkRequireElements = (object: IPostAttachment): void | ValidationError => {
        if(object.path.trim() === ''){
            return {error:'File path is required'}
        }
        if(object.mime_type.trim() === ''){
            return {error:'MIME type is required'}
        }
        if(!object.post_id || object.post_id <= 0){
            return {error:'Valid post ID is required'}
        }
    }

    const api = {
        generateObject:(row:any): IPostAttachment =>{
            const object:IPostAttachment = {
                id: row.id,
                post_id: row.post_id,
                path: row.path,
                mime_type: row.mime_type
            }
            return object;
        },

        //get all attachments for a specific post
        getPostAttachments: async(post_id:number) : Promise<Array<IPostAttachment>> => {
            const results: IPostAttachment[] = [];
            const sql = `select * from data.post_attachments where post_id = $1 order by id`;
            const response = await DB().qeuery(sql,[post_id])
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results
        },

        //get single attachment by ID
        getSingle:async(id:number): Promise<IPostAttachment | void> => {
            const sql = `SELECT * FROM data.post_attachments where id = $1`;
            const response = await DB().qeuery(sql,[id]);
            for(const row of response){
                const record = api.generateObject(row);
                return record;
            }
        },

        //get attachments by mime type (images, videos, etc)
        getAttachmentsByType: async(post_id:number, mime_type_prefix:string): Promise<Array<IPostAttachment>> => {
            const results: IPostAttachment[] = [];
            const sql = `select * from data.post_attachments where post_id = $1 and mime_type like $2 order by id`;
            const response = await DB().qeuery(sql,[post_id, `${mime_type_prefix}%`]);
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results;
        },

        //get all images for a post
        getPostImages: async(post_id:number): Promise<Array<IPostAttachment>> => {
            return await api.getAttachmentsByType(post_id, 'image/');
        },

        //get all videos for a post
        getPostVideos: async(post_id:number): Promise<Array<IPostAttachment>> => {
            return await api.getAttachmentsByType(post_id, 'video/');
        },

        //get attachment count for a post
        getAttachmentCount: async(post_id:number): Promise<number> => {
            const sql = `select count(*) as count from data.post_attachments where post_id = $1`;
            const response = await DB().qeuery(sql,[post_id]);
            return parseInt(response[0].count) || 0;
        },

        //check if post has attachments
        hasAttachments: async(post_id:number): Promise<boolean> => {
            const count = await api.getAttachmentCount(post_id);
            return count > 0;
        },

        //get posts with attachment info (for feed display)
        getPostsWithAttachments: async(limit:number = 20, offset:number = 0): Promise<Array<any>> => {
            const results: any[] = [];
            const sql = `
                select p.id, p.user_id, p.text, p.created, p.visibility,
                       count(pa.id) as attachment_count,
                       string_agg(pa.mime_type, ',') as mime_types
                from data.posts p
                left join data.post_attachments pa on p.id = pa.post_id
                where p.visibility = 'public'
                group by p.id, p.user_id, p.text, p.created, p.visibility
                order by p.created desc
                limit $1 offset $2
            `;
            const response = await DB().qeuery(sql,[limit, offset]);
            for(const row of response){
                results.push({
                    id: row.id,
                    user_id: row.user_id,
                    text: row.text,
                    created: row.created,
                    visibility: row.visibility,
                    attachment_count: parseInt(row.attachment_count) || 0,
                    mime_types: row.mime_types ? row.mime_types.split(',') : []
                });
            }
            return results;
        },

        insert:async(object:IPostAttachment): Promise<IPostAttachment | ValidationError> => {
            const result = checkRequireElements(object);
            if(result){
                return result;
            }

            const sql = `
                insert into data.post_attachments
                (post_id, path, mime_type)
                values
                ($1, $2, $3)
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.post_id,
                object.path.trim(),
                object.mime_type.trim()
            ]);

            if(!response[0]){
                throw new Error('unable to create attachment record')
            }

            return api.generateObject(response[0]);
        },

        //insert multiple attachments for a post
        insertMultiple:async(post_id:number, attachments:Array<{path:string, mime_type:string}>): Promise<Array<IPostAttachment> | ValidationError> => {
            if(!post_id || post_id <= 0){
                return {error:'Valid post ID is required'};
            }

            if(!attachments || attachments.length === 0){
                return {error:'At least one attachment is required'};
            }

            const results: IPostAttachment[] = [];

            for(const attachment of attachments){
                const newAttachment = await api.insert({
                    id: 0, // will be generated
                    post_id,
                    path: attachment.path,
                    mime_type: attachment.mime_type
                });

                if('error' in newAttachment){
                    return newAttachment;
                }

                results.push(newAttachment);
            }

            return results;
        },

        update:async(object:IPostAttachment): Promise<IPostAttachment | ValidationError> => {
            const result = checkRequireElements(object);
            if(result){
                return result;
            }

            const sql = `
                update data.post_attachments set
                    path = $1,
                    mime_type = $2
                where id = $3
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.path.trim(),
                object.mime_type.trim(),
                object.id
            ]);

            if(!response[0]){
                throw new Error('unable to update attachment record')
            }

            return api.generateObject(response[0]);
        },

        //delete attachment
        delete: async(id:number): Promise<boolean> => {
            const sql = `
                delete from data.post_attachments 
                where id = $1
            `;
            const response = await DB().qeuery(sql,[id]);
            return response.length > 0;
        },

        //delete all attachments from a post
        deleteAllPostAttachments: async(post_id:number): Promise<number> => {
            const sql = `delete from data.post_attachments where post_id = $1`;
            const response = await DB().qeuery(sql,[post_id]);
            return response.length;
        },

        //get attachment file info (for cleanup/storage management)
        getAllAttachmentPaths: async(): Promise<Array<string>> => {
            const results: string[] = [];
            const sql = `select path from data.post_attachments`;
            const response = await DB().qeuery(sql);
            for(const row of response){
                results.push(row.path);
            }
            return results;
        },

        //get orphaned attachments (attachments without posts)
        getOrphanedAttachments: async(): Promise<Array<IPostAttachment>> => {
            const results: IPostAttachment[] = [];
            const sql = `
                select pa.* 
                from data.post_attachments pa
                left join data.posts p on pa.post_id = p.id
                where p.id is null
            `;
            const response = await DB().qeuery(sql);
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results;
        },

        //cleanup orphaned attachments
        cleanupOrphanedAttachments: async(): Promise<number> => {
            const sql = `
                delete from data.post_attachments 
                where post_id not in (select id from data.posts)
            `;
            const response = await DB().qeuery(sql);
            return response.length;
        }
    }
    return api;
}