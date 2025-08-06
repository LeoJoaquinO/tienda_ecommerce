
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';
import type { CartItem } from '@/lib/types';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});
const preference = new Preference(client);

interface PreferencePayload {
    items: {
        id: string;
        title: string;
        quantity: number;
        unit_price: number;
    }[];
    payer: {
        name: string;
        surname: string;
        email: string;
    },
    totalAmount: number;
}

export async function POST(req: NextRequest) {
    try {
        const { items, payer, totalAmount }: PreferencePayload = await req.json();

        // Basic validation
        if (!items || items.length === 0 || !payer || !totalAmount) {
            return NextResponse.json({ error: 'Datos de preferencia inválidos.' }, { status: 400 });
        }
        
        const preferenceData: PreferenceCreateData = {
            body: {
                items: items,
                payer: {
                    name: payer.name,
                    surname: payer.surname,
                    email: payer.email,
                },
                payment_methods: {
                    excluded_payment_types: [], // No exclusions to allow all methods
                    installments: 1, // You can make this dynamic if needed
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
                },
                auto_return: 'approved',
                // The notification URL is for server-to-server updates
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago-webhook`,
            },
        };

        const result = await preference.create(preferenceData);

        return NextResponse.json({ id: result.id });

    } catch (error: any) {
        console.error("Error creating Mercado Pago preference:", error);
        return NextResponse.json(
            { error: error.message || "No se pudo crear la preferencia de pago." },
            { status: 500 }
        );
    }
}
