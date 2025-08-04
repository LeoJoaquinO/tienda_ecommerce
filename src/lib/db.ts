
import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

/**
 * Lazily creates and returns a singleton database connection pool.
 * This function should only be called by server-side functions that
 * have already verified that the necessary environment variables are set.
 */
export function getPool(): mysql.Pool {
    if (pool) {
        return pool;
    }
    
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_DATABASE) {
        // This should not happen if called correctly, but it's a safeguard.
        throw new Error("Database environment variables are not fully configured.");
    }
    
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    return pool;
}

