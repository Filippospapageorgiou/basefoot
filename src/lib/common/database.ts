import { Pool, type PoolClient } from "pg";
import { DB_HOST, 
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
} from '$env/static/private'

// Create pool instance ONCE, not on every query
let pool: Pool | null = null;

const getPool = async (): Promise<Pool> => {
    if (!pool) {
        pool = new Pool({
            host: DB_HOST,
            user: DB_USER,
            port: parseInt(DB_PORT || '5432'),
            password: DB_PASSWORD,
            database: DB_NAME,
            max: 10, // Maximum number of connections in pool
            idleTimeoutMillis: 30000, // Close idle connections after 30s
            connectionTimeoutMillis: 2000, // Timeout if can't connect within 2s
        });
        
        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    return pool;
}

export const DB = () => {
    const api = {
        qeuery: async (sql: string, params: any[] = []): Promise<Array<any>> => {
            const pool = await getPool();
            const client = await pool.connect(); // Get client from pool
            
            try {
                const result = await client.query(sql, params);
                return result.rows;
            } catch (error: any) {
                console.log('Database query error:', error);
                throw new Error('Unable to run query');
            } finally {
                client.release(); // CRITICAL: Always release the connection back to pool
            }
        },

        // Optional: Method to close all connections (useful for cleanup)
        close: async () => {
            if (pool) {
                await pool.end();
                pool = null;
            }
        }
    }

    return api;
}

// Optional: Graceful shutdown handling
process.on('SIGINT', async () => {
    if (pool) {
        await pool.end();
        console.log('Database pool closed.');
    }
    process.exit(0);
});