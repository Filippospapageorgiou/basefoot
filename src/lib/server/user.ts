import type { IUser, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const User = () => {

    //validation user helper method
    const checkRequireElements = (object: IUser): void | ValidationError => {
        if(object.name.trim() === ''){
            return {error:'Please all requested fields'}
        }
        if(object.email.trim() === ''){
            return {error:'Please all requested fields'}
        }
        if(object.occupation.trim() === ''){
            return {error:'Please all requested fields'}
        }
        if(object.location.trim() === ''){
            return {error:'Please all requested fields'}
        }
    }

    const api = {
        generateObject:(row:any): IUser =>{
            const object:IUser = {
                id:row.id,
                email:row.email,
                name:row.name,
                location:row.location,
                occupation:row.occupation,
                avatar_path:row.avatar_path,
                created_at:row.created_at,
                updated_at:row.updated_at
            }
            return object;
        },

        //get all users for searching
        getAll: async() : Promise<Array<IUser>> => {
            const results: IUser[] = [];
            const sql = `select * from data.users order by name`;
            const response = await DB().qeuery(sql)
            for(const row of response){
                const record = api.generateObject(row);
                results.push(record);
            }
            return results
        },

        //get single user
        getSingle:async(id:number): Promise<IUser | void> => {
            const sql = `SELECT * FROM data.users where id = $1`;
            const response = await DB().qeuery(sql,[id]);
            for(const row of response){
                const record = api.generateObject(row);
                return record;
            }
        },

        update:async(object:IUser): Promise<IUser | ValidationError> => {
            const result = checkRequireElements(object);
            if(result){
                return result;
            }

            const sql = `
                update data.users set
                    email = $1,
                    name = $2,
                    location = $3,
                    occupation = $4
                    where id = $5
            `;
            const response = await DB().qeuery(sql,[
                object.email,
                object.name,
                object.location,
                object.occupation,
                object.id
            ]);

            if(!response[0]){
                throw new Error('unable to update record')
            }

            return api.generateObject(response[0]);

        },

        insert:async(object:IUser, new_password:string): Promise<IUser | ValidationError> => {
            const result = checkRequireElements(object);
            if(result){
                return result;
            }

            const sql = `
                insert into data.users
                (email,hash_password,name,location,occupation, avatar_path)
                values
                ($1,crypt($2, gen_salt('bf',8)),$3,$4,$5,$6)
                returning *
            `;
            const response = await DB().qeuery(sql,[
                object.email,
                new_password,
                object.name,
                object.location,
                object.occupation,
                object.avatar_path
            ]);

            if(!response[0]){
                throw new Error('unable to update record')
            }

            return api.generateObject(response[0]);

        },

        updatePassword: async(id:number, new_password:string): Promise<void> => {
            const sql = `update data.users set hash_password = crypt($1, gen_salt('bf',8))
            where id = $2`;
            await DB().qeuery(sql,[new_password, id]);
        }

    }
    return api;
}