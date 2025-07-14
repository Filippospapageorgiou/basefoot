import type { IUser, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const User = () => {

    //validation user helper method
    const checkRequireElements = (object: IUser): void | ValidationError => {
        if(object.name.trim() === ''){
            return {error:'Please fill all requested fields'}
        }
        if(object.email.trim() === ''){
            return {error:'Please fill all requested fields'}
        }
        if(object.occupation.trim() === ''){
            return {error:'Please fill all requested fields'}
        }
        if(object.location.trim() === ''){
            return {error:'Please fill all requested fields'}
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
                    occupation = $4,
                    avatar_path = $5
                    where id = $6
                    returning *
            `;
            const response = await DB().qeuery(sql,[
                object.email,
                object.name,
                object.location,
                object.occupation,
                object.avatar_path,
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

            const sqlExistsEmail = `SELECT id FROM data.users WHERE email = $1`;
            const existingEmail = await DB().qeuery(sqlExistsEmail, [object.email]);
    
            if(existingEmail.length > 0){
                return {error: 'A user with this email already exists'};
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
                throw new Error('unable to insert record')
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