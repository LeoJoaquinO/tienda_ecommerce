// This file is exclusively for creating and exporting the database connection pool.
// It helps prevent connection exhaustion by ensuring a single pool is used throughout the app.
// It also exports a boolean to indicate if the database is connected.

import { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

// The DATABASE_URL environment variable is the single source of truth for the connection.
// It's set automatically by Vercel when you link a Neon database.
if (process.env.DATABASE_URL) {
    try {
        pool = new Pool({
            uri: process.env.DATABASE_URL,
            connectionLimit: 10,
            ssl: {
                rejectUnauthorized: true,
            },
        });
        console.log('Successfully created database connection pool.');
    } catch (e) {
        console.error('Failed to create database connection pool:', e);
    }
} else {
    console.log('DATABASE_URL not found. Application will use hardcoded data.');
}

export const db = pool;
export const isDbConnected = !!pool;
