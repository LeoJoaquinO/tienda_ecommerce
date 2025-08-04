
import pool from './db';

// This file is designed to work with a database.
// The hardcoded logic is minimal as this feature is database-dependent.
let hardcodedSubscribers: { email: string }[] = [];


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
    // In local mode, we just add to an array and log it.
    if (hardcodedSubscribers.find(s => s.email === email)) {
        throw new Error("Este email ya está suscripto.");
    }
    hardcodedSubscribers.push({ email });
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
