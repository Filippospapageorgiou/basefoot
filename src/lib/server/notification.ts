import type { INotification, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const Notification = () => {

    //validation notification helper method
    const checkRequireElements = (object: INotification): void | ValidationError => {
        if(object.text.trim() === ''){
            return {error:'Notification text is required'}
        }
        if(object.text.length > 500){
            return {error:'Notification text cannot exceed 500 characters'}
        }
        if(!object.user_id || object.user_id <= 0){
            return {error:'Valid user ID is required'}
        }
        if(!object.friend_id || object.friend_id <= 0){
            return {error:'Valid friend ID is required'}
        }
    }

    const api = {
        generateObject:(row:any): INotification =>{
            const object:INotification = {
                id: row.id,
                created: row.created,
                user_id: row.user_id,
                friend_id: row.friend_id,
                text: row.text,
                viewed: row.viewed,
                post_id: row.post_id
            }
            return object;
        },

        //get all notifications for a user
        getUserNotifications: async(user_id:number) : Promise<Array<INotification>> => {
            const results: INotification[] = [];
            const sql = `select * from data.notifications where user_id = $1 order by created desc`;
            const response = await DB().qeuery(sql,[user_id])
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results
        },

        //get unread notifications for a user
        getUnreadNotifications: async(user_id:number): Promise<Array<INotification>> => {
            const results: INotification[] = [];
            const sql = `select * from data.notifications where user_id = $1 and viewed = false order by created desc`;
            const response = await DB().qeuery(sql,[user_id]);
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results;
        },

        //get single notification by ID
        getSingle:async(id:number): Promise<INotification | void> => {
            const sql = `SELECT * FROM data.notifications where id = $1`;
            const response = await DB().qeuery(sql,[id]);
            for(const row of response){
                const record = api.generateObject(row);
                return record;
            }
        },

        //get notifications with sender details
        getNotificationsWithSender: async(user_id:number): Promise<Array<any>> => {
            const results: any[] = [];
            const sql = `
                select n.*, u.name as sender_name, u.email as sender_email, u.avatar_path as sender_avatar
                from data.notifications n
                inner join data.users u on n.friend_id = u.id
                where n.user_id = $1
                order by n.created desc
            `;
            const response = await DB().qeuery(sql,[user_id]);
            for(const row of response){
                results.push({
                    id: row.id,
                    created: row.created,
                    user_id: row.user_id,
                    friend_id: row.friend_id,
                    text: row.text,
                    viewed: row.viewed,
                    post_id: row.post_id,
                    sender_name: row.sender_name,
                    sender_email: row.sender_email,
                    sender_avatar: row.sender_avatar
                });
            }
            return results;
        },

        //get notification count for a user
        getNotificationCount: async(user_id:number): Promise<number> => {
            const sql = `select count(*) as count from data.notifications where user_id = $1`;
            const response = await DB().qeuery(sql,[user_id]);
            return parseInt(response[0].count) || 0;
        },

        //get unread notification count for a user
        getUnreadCount: async(user_id:number): Promise<number> => {
            const sql = `select count(*) as count from data.notifications where user_id = $1 and viewed = false`;
            const response = await DB().qeuery(sql,[user_id]);
            return parseInt(response[0].count) || 0;
        },

        insert:async(object:INotification): Promise<INotification | ValidationError> => {
            const result = checkRequireElements(object);
            if(result){
                return result;
            }

            const sql = `
                insert into data.notifications
                (user_id, friend_id, text, post_id)
                values
                ($1, $2, $3, $4)
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.user_id,
                object.friend_id,
                object.text.trim(),
                object.post_id || null
            ]);

            if(!response[0]){
                throw new Error('unable to create notification record')
            }

            return api.generateObject(response[0]);
        },

        //mark notification as viewed
        markAsViewed: async(id:number, user_id:number): Promise<INotification | ValidationError> => {
            const sql = `
                update data.notifications set
                    viewed = true
                where id = $1 and user_id = $2
                returning *
            `;
            const response = await DB().qeuery(sql,[id, user_id]);

            if(!response[0]){
                throw new Error('unable to update notification or permission denied')
            }

            return api.generateObject(response[0]);
        },

        //mark all notifications as viewed for a user
        markAllAsViewed: async(user_id:number): Promise<number> => {
            const sql = `
                update data.notifications set
                    viewed = true
                where user_id = $1 and viewed = false
            `;
            const response = await DB().qeuery(sql,[user_id]);
            return response.length;
        },

        //delete notification
        delete: async(id:number, user_id:number): Promise<boolean> => {
            const sql = `
                delete from data.notifications 
                where id = $1 and user_id = $2
            `;
            const response = await DB().qeuery(sql,[id, user_id]);
            return response.length > 0;
        },

        //delete all notifications for a user
        deleteAllUserNotifications: async(user_id:number): Promise<number> => {
            const sql = `delete from data.notifications where user_id = $1`;
            const response = await DB().qeuery(sql,[user_id]);
            return response.length;
        },

        //delete all notifications sent by a user (when user is deleted)
        deleteAllSentByUser: async(friend_id:number): Promise<number> => {
            const sql = `delete from data.notifications where friend_id = $1`;
            const response = await DB().qeuery(sql,[friend_id]);
            return response.length;
        },

        //delete all notifications related to a post
        deleteAllPostNotifications: async(post_id:number): Promise<number> => {
            const sql = `delete from data.notifications where post_id = $1`;
            const response = await DB().qeuery(sql,[post_id]);
            return response.length;
        }
    }
    return api;
}