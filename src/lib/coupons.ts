'use server';

import type { Coupon } from './types';
import * as hardcodedData from './hardcoded-data';
import * as dbActions from './db-actions';

const USE_DB = !!process.env.DB_HOST;

export async function getCoupons(): Promise<Coupon[]> {
    if (USE_DB) {
        return dbActions.getCouponsFromDb();
    }
    return hardcodedData.getCoupons();
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    if (USE_DB) {
        return dbActions.createCouponInDb(coupon);
    }
    return hardcodedData.createCoupon(coupon);
}

export async function updateCoupon(id: number, coupon: Partial<Omit<Coupon, 'id'>>): Promise<Coupon> {
    if (USE_DB) {
        return dbActions.updateCouponInDb(id, coupon);
    }
    return hardcodedData.updateCoupon(id, coupon);
}

export async function deleteCoupon(id: number): Promise<void> {
    if (USE_DB) {
        return dbActions.deleteCouponFromDb(id);
    }
    return hardcodedData.deleteCoupon(id);
}
