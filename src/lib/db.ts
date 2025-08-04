
import mysql from 'mysql2/promise';

if (!process.env.DB_HOST) {
  console.warn("Database environment variables are not set. The application will run in hardcoded data mode.");
}

// The pool is only created if the DB_HOST environment variable is set.
// This prevents connection attempts during build or when running locally without a DB.
const pool = process.env.DB_HOST ? mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}) : null;


export default pool;
