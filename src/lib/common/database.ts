import { Pool, type PoolClient } from "pg";
import { DB_HOST, 
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
} from '$env/static/private'

export const DB = () => {
    const getPool = async (): Promise<PoolClient> => {
        try{
            const pool = new Pool({
                host: DB_HOST,
                user: DB_USER,
                port: parseInt(DB_PORT || '5432'),
                password: DB_PASSWORD,
                database: DB_NAME,
            })
            return await pool.connect();
        }catch(error:any){
            console.log(error);
            throw new Error("unable to connect to database");
        }
    }
    const api = {
        qeuery: async(sql:string, params: any[] = []): Promise<Array<any>> => {
            const db = await getPool();
            try{
                const result = await db.query(sql, params);
                return result.rows;
            }catch(error:any){
                console.log(error);
                throw new Error('unable to run qeuere');
            }
        }
    }

    return api;
}