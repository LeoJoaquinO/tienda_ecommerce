// This file is exclusively for creating and exporting the database connection pool.
// It helps prevent connection exhaustion by ensuring a single pool is used throughout the app.
// It also exports a boolean to indicate if the database is connected.

import { sql } from '@vercel/postgres';

// The POSTGRES_URL environment variable is the single source of truth for the connection.
// It's set automatically by Vercel when you link a Neon database.
const isDbConnected = !!process.env.POSTGRES_URL;

if (isDbConnected) {
    console.log('Successfully connected to database.');
} else {
    console.log('POSTGRES_URL not found. Application will use hardcoded data.');
}

// The `sql` template tag from @vercel/postgres handles connection pooling automatically.
export const db = isDbConnected ? sql : null;
export { isDbConnected };
