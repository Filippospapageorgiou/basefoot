import type { IUser } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const User = () => {
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
        }

        //TODO GET single min 8:31!
    }
    return api;
}