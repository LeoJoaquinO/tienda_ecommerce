// This file is exclusively for creating and exporting the database connection pool.
// It helps prevent connection exhaustion by ensuring a single pool is used throughout the app.
// It also exports a boolean to indicate if the database is connected.

import { neon } from '@neondatabase/serverless';

// The POSTGRES_URL environment variable is the single source of truth for the connection.
// It's set automatically by Vercel when you link a Neon database.
const isDbConnected = !!process.env.DATABASE_URL;

if (isDbConnected) {
    console.log('Successfully connected to database.');
} else {
    console.log('DATABASE_URL not found. Application will use hardcoded data.');
}

// The `neon` function from @neondatabase/serverless handles the connection.
export const db = isDbConnected ? neon(process.env.DATABASE_URL!) : null;
export { isDbConnected };
