import type { IFriend, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const Friend = () => {

    const api = {
        generateObject:(row:any): IFriend =>{
            const object:IFriend = {
                friend_id: row.friend_id,
                user_id: row.user_id
            }
            return object;
        },

        //get all friends for a user
        getUserFriends: async(user_id:number) : Promise<Array<IFriend>> => {
            const results: IFriend[] = [];
            const sql = `select * from data.friends where user_id = $1`;
            const response = await DB().qeuery(sql,[user_id])
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results
        },

        //get all users who have this user as friend (reverse lookup)
        getFollowers: async(user_id:number): Promise<Array<IFriend>> => {
            const results: IFriend[] = [];
            const sql = `select * from data.friends where friend_id = $1`;
            const response = await DB().qeuery(sql,[user_id]);
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results;
        },

        //check if friendship exists
        checkFriendship: async(user_id:number, friend_id:number): Promise<boolean> => {
            const sql = `select * from data.friends where user_id = $1 and friend_id = $2`;
            const response = await DB().qeuery(sql,[user_id, friend_id]);
            return response.length > 0;
        },

        //check if mutual friendship exists (both directions)
        checkMutualFriendship: async(user_id:number, friend_id:number): Promise<boolean> => {
            const sql = `
                select * from data.friends 
                where (user_id = $1 and friend_id = $2) 
                or (user_id = $2 and friend_id = $1)
            `;
            const response = await DB().qeuery(sql,[user_id, friend_id]);
            return response.length >= 2;
        },

        //get friends with user details
        getFriendsWithDetails: async(user_id:number): Promise<Array<any>> => {
            const results: any[] = [];
            const sql = `
                select f.*, u.name, u.email, u.avatar_path, u.location, u.occupation
                from data.friends f
                inner join data.users u on f.friend_id = u.id
                where f.user_id = $1
                order by u.name
            `;
            const response = await DB().qeuery(sql,[user_id]);
            for(const row of response){
                results.push({
                    friend_id: row.friend_id,
                    user_id: row.user_id,
                    name: row.name,
                    email: row.email,
                    avatar_path: row.avatar_path,
                    location: row.location,
                    occupation: row.occupation
                });
            }
            return results;
        },

        //get mutual friends between two users
        getMutualFriends: async(user_id:number, other_user_id:number): Promise<Array<any>> => {
            const results: any[] = [];
            const sql = `
                select distinct u.id, u.name, u.email, u.avatar_path
                from data.friends f1
                inner join data.friends f2 on f1.friend_id = f2.friend_id
                inner join data.users u on f1.friend_id = u.id
                where f1.user_id = $1 and f2.user_id = $2
                order by u.name
            `;
            const response = await DB().qeuery(sql,[user_id, other_user_id]);
            for(const row of response){
                results.push({
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    avatar_path: row.avatar_path
                });
            }
            return results;
        },

        //get friend count for a user
        getFriendCount: async(user_id:number): Promise<number> => {
            const sql = `select count(*) as count from data.friends where user_id = $1`;
            const response = await DB().qeuery(sql,[user_id]);
            return parseInt(response[0].count) || 0;
        },

        insert:async(object:IFriend): Promise<IFriend | ValidationError> => {
            //check if friendship already exists
            const alreadyFriends = await api.checkFriendship(object.user_id, object.friend_id);
            if(alreadyFriends){
                return {error:'Friendship already exists'};
            }

            //check if trying to add self as friend
            if(object.user_id === object.friend_id){
                return {error:'Cannot add yourself as friend'};
            }

            const sql = `
                insert into data.friends
                (user_id, friend_id)
                values
                ($1, $2)
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.user_id,
                object.friend_id
            ]);

            if(!response[0]){
                throw new Error('unable to create friendship record')
            }

            return api.generateObject(response[0]);
        },

        //add mutual friendship (both directions)
        insertMutual:async(user_id:number, friend_id:number): Promise<Array<IFriend> | ValidationError> => {
            //check if trying to add self as friend
            if(user_id === friend_id){
                return {error:'Cannot add yourself as friend'};
            }

            //check if friendship already exists
            const alreadyFriends = await api.checkMutualFriendship(user_id, friend_id);
            if(alreadyFriends){
                return {error:'Mutual friendship already exists'};
            }

            const results: IFriend[] = [];

            //add first direction
            const friend1 = await api.insert({user_id, friend_id});
            if('error' in friend1){
                return friend1;
            }
            results.push(friend1);

            //add second direction
            const friend2 = await api.insert({user_id: friend_id, friend_id: user_id});
            if('error' in friend2){
                //rollback first insertion if second fails
                await api.delete(user_id, friend_id);
                return friend2;
            }
            results.push(friend2);

            return results;
        },

        //remove friendship
        delete: async(user_id:number, friend_id:number): Promise<boolean> => {
            const sql = `
                delete from data.friends 
                where user_id = $1 and friend_id = $2
            `;
            const response = await DB().qeuery(sql,[user_id, friend_id]);
            return response.length > 0;
        },

        //remove mutual friendship (both directions)
        deleteMutual: async(user_id:number, friend_id:number): Promise<number> => {
            const sql = `
                delete from data.friends 
                where (user_id = $1 and friend_id = $2) 
                or (user_id = $2 and friend_id = $1)
            `;
            const response = await DB().qeuery(sql,[user_id, friend_id]);
            return response.length;
        },

        //remove all friendships for a user (when user is deleted)
        deleteAllUserFriendships: async(user_id:number): Promise<number> => {
            const sql = `
                delete from data.friends 
                where user_id = $1 or friend_id = $1
            `;
            const response = await DB().qeuery(sql,[user_id]);
            return response.length;
        }
    }
    return api;
}