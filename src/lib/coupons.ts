'use server';

import type { Coupon } from './types';
import pool from './db';
import { RowDataPacket } from 'mysql2';

function handleDbError(error: any, context: string): never {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        const friendlyError = 'Could not connect to the database. Please ensure the database server is running and the connection details in your .env.local file are correct.';
        console.error(`Database connection refused during ${context}:`, friendlyError);
        throw new Error(friendlyError);
    }
    console.error(`Failed to ${context}:`, error);
    throw new Error(`A database error occurred during ${context}.`);
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

export async function getCoupons(): Promise<Coupon[]> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons ORDER BY id DESC');
        return rows.map(rowToCoupon);
    } catch (error) {
        handleDbError(error, 'fetching coupons');
    }
}

export async function getCouponById(id: number): Promise<Coupon | undefined> {
     try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE id = ?', [id]);
        if (rows.length > 0) {
            return rowToCoupon(rows[0]);
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching coupon with id ${id}`);
    }
}


export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date > NOW())', [code.toUpperCase()]);
        if (rows.length > 0) {
            return rowToCoupon(rows[0]);
        }
        return undefined;
    } catch (error) {
        handleDbError(error, `fetching coupon with code ${code}`);
    }
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
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
}


export async function updateCoupon(id: number, coupon: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
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
}


export async function deleteCoupon(id: number): Promise<void> {
    try {
        await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    } catch (error) {
        handleDbError(error, `deleting coupon with id ${id}`);
    }
}
