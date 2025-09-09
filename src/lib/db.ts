// This file is exclusively for creating and exporting the database connection pool.
// It helps prevent connection exhaustion by ensuring a single pool is used throughout the app.
// It also exports a boolean to indicate if the database is connected.

import { neon } from '@neondatabase/serverless';

// Vercel automatically sets POSTGRES_URL when linking a Neon database.
// We also check for DATABASE_URL for local development or other environments.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const isDbConnected = !!connectionString;

if (isDbConnected) {
    console.log('Successfully connected to database.');
} else {
    console.log('POSTGRES_URL or DATABASE_URL not found. Application will use hardcoded data.');
}

// The `neon` function from @neondatabase/serverless handles the connection.
export const db = isDbConnected ? neon(connectionString) : null;
export { isDbConnected };
