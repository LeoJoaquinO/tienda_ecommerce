
import pool from './db';
import { RowDataPacket } from 'mysql2';
import type { Subscriber } from './types';

// This file is designed to work with a database.
// The hardcoded logic is minimal as this feature is database-dependent.
let hardcodedSubscribers: Subscriber[] = [
    { id: 1, email: 'test1@example.com', created_at: new Date() },
    { id: 2, email: 'test2@example.com', created_at: new Date() },
];
let nextId = 3;


function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
}


export async function addSubscriber(email: string): Promise<void> {
    // --- Hardcoded Logic ---
    if (hardcodedSubscribers.find(s => s.email === email)) {
        throw new Error("Este email ya está suscripto.");
    }
    hardcodedSubscribers.push({ id: nextId++, email, created_at: new Date() });
    console.log(`(Hardcoded) New subscriber added: ${email}`);
    return Promise.resolve();

    // --- Database Logic ---
    /*
    try {
        await pool.query(
            'INSERT INTO subscribers (email) VALUES (?)',
            [email]
        );
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Este email ya está suscripto.');
        }
        handleDbError(error, 'adding a subscriber');
    }
    */
}

export async function getSubscribers(): Promise<Subscriber[]> {
    // --- Hardcoded Logic ---
    return Promise.resolve(hardcodedSubscribers);

    // --- Database Logic ---
    /*
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM subscribers ORDER BY created_at DESC');
        return rows.map(row => ({
            id: row.id,
            email: row.email,
            created_at: new Date(row.created_at),
        }));
    } catch (error) {
        handleDbError(error, 'fetching subscribers');
    }
    */
}

    