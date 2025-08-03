
import type { Coupon } from './types';
import pool from './db';
import { RowDataPacket } from 'mysql2';

// --- Hardcoded Data for Initial Setup ---
let hardcodedCoupons: Coupon[] = [
    { id: 1, code: "JOYA10", discountType: "percentage", discountValue: 10, expiryDate: new Date('2025-12-31'), isActive: true },
    { id: 2, code: "ENVIOFREE", discountType: "fixed", discountValue: 50, expiryDate: new Date('2025-12-31'), isActive: true },
    { id: 3, code: "EXPIRED", discountType: "percentage", discountValue: 99, expiryDate: new Date('2020-01-01'), isActive: false },
];

function isCouponActive(coupon: Coupon): boolean {
    const now = new Date();
    if (!coupon.isActive) return false;
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
        return false;
    }
    return true;
}

function rowToCoupon(row: RowDataPacket): Coupon {
    return {
        id: row.id,
        code: row.code,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
        isActive: Boolean(row.is_active),
    };
}


function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
}


export async function getCoupons(): Promise<Coupon[]> {
    // Hardcoded logic
    return Promise.resolve(hardcodedCoupons);

    // --- Database Logic ---
    /*
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons ORDER BY id DESC');
        return rows.map(rowToCoupon);
    } catch (error) {
        handleDbError(error, 'fetching coupons');
    }
    */
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    // Hardcoded logic
    const coupon = hardcodedCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coupon && isCouponActive(coupon)) {
        return Promise.resolve(coupon);
    }
    return Promise.resolve(undefined);

    // --- Database Logic ---
    /*
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE code = ?', [code]);
        if (rows.length > 0) {
            const coupon = rowToCoupon(rows[0]);
            return isCouponActive(coupon) ? coupon : undefined;
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching coupon with code ${code}`);
    }
    */
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    // Hardcoded logic
    const newId = hardcodedCoupons.length > 0 ? Math.max(...hardcodedCoupons.map(c => c.id)) + 1 : 1;
    const existingCoupon = hardcodedCoupons.find(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (existingCoupon) {
        throw new Error(`Error: El código de cupón '${coupon.code}' ya existe.`);
    }
    const newCoupon: Coupon = { ...coupon, id: newId };
    hardcodedCoupons.push(newCoupon);
    return Promise.resolve(newCoupon);
    
    // --- Database Logic ---
    /*
    const { code, discountType, discountValue, expiryDate, isActive } = coupon;
    try {
        const [result] = await pool.query<any>(
            'INSERT INTO coupons (code, discount_type, discount_value, expiry_date, is_active) VALUES (?, ?, ?, ?, ?)',
            [code.toUpperCase(), discountType, discountValue, expiryDate, isActive]
        );
        const newDbCoupon = await getCouponById(result.insertId);
        if (!newDbCoupon) {
            throw new Error('Failed to retrieve coupon after creation.');
        }
        return newDbCoupon;
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El código de cupón '${code}' ya existe.`);
        }
        handleDbError(error, 'creating a coupon');
    }
    */
}


export async function updateCoupon(id: number, coupon: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    // Hardcoded logic
    const index = hardcodedCoupons.findIndex(c => c.id === id);
    if (index !== -1) {
        // Check for duplicate code on update
        const existingCoupon = hardcodedCoupons.find(c => c.code.toUpperCase() === coupon.code?.toUpperCase() && c.id !== id);
        if (existingCoupon) {
            throw new Error(`Error: El código de cupón '${coupon.code}' ya existe.`);
        }
        hardcodedCoupons[index] = { ...hardcodedCoupons[index], ...coupon };
        return Promise.resolve(hardcodedCoupons[index]);
    }
    throw new Error("Coupon not found");

    // --- Database Logic ---
    /*
    const { code, discountType, discountValue, expiryDate, isActive } = coupon;
    try {
        await pool.query(
            'UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, expiry_date = ?, is_active = ? WHERE id = ?',
            [code?.toUpperCase(), discountType, discountValue, expiryDate, isActive, id]
        );
        const updatedCoupon = await getCouponById(id);
        if (!updatedCoupon) {
            throw new Error('Failed to retrieve coupon after update.');
        }
        return updatedCoupon;
    } catch (error: any) {
         if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El código de cupón '${code}' ya existe.`);
        }
        handleDbError(error, `updating coupon with id ${id}`);
    }
    */
}


export async function deleteCoupon(id: number): Promise<void> {
    // Hardcoded logic
    const index = hardcodedCoupons.findIndex(c => c.id === id);
    if (index !== -1) {
        hardcodedCoupons.splice(index, 1);
    }
    return Promise.resolve();

    // --- Database Logic ---
    /*
    try {
        await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    } catch (error) {
        handleDbError(error, `deleting coupon with id ${id}`);
    }
    */
}


// Needed for DB logic, even if not used by hardcoded version yet
export async function getCouponById(id: number): Promise<Coupon | undefined> {
    // Hardcoded logic
    const coupon = hardcodedCoupons.find(c => c.id === id);
    return Promise.resolve(coupon);
    
    // --- Database Logic ---
    /*
     try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE id = ?', [id]);
        if (rows.length > 0) {
            return rowToCoupon(rows[0]);
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching coupon with id ${id}`);
    }
    */
}
