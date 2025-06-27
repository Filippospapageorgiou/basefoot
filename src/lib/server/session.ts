import type { ISession, IUser, ValidationError } from "$lib/interfaces";
import { DB } from "$lib/common/database";

export const Session = () => {

    const api = {
        generateObject:(row:any): ISession =>{
            const object:ISession = {
                gui_id: row.gui_id,
                user_id: row.user_id,
                expires: row.expires
            }
            return object;
        },


        //get session for user
        getSingle:async(gui_id:string): Promise<ISession | void> => {
            const sql = `SELECT * FROM data.sessions where gui_id = $1`;
            const response = await DB().qeuery(sql,[gui_id]);
            for(const row of response){
                const record = api.generateObject(row);
                return record;
            }
        },

        
        insert:async(user_id:number): Promise<ISession | ValidationError> => {
            const sql = `
                insert into data.sessions
                (user_id)
                values
                ($1)
                returning *
            `;
            const response = await DB().qeuery(sql,[
                user_id
            ]);

            if(!response[0]){
                throw new Error('unable to update record')
            }

            return api.generateObject(response[0]);

        }
    }
    return api;
}