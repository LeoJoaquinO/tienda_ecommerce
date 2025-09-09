
'use server';

import mailchimp from "@mailchimp/mailchimp_marketing";
import type { Subscriber } from './types';

// Configure Mailchimp client
if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX) {
    mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
    });
}


function handleApiError(error: any, context: string): never {
    console.error(`Mailchimp API error during ${context}:`, error);
    // Try to parse a Mailchimp-specific error response
    if (error.response?.body?.title) {
        throw new Error(`Mailchimp: ${error.response.body.title} - ${error.response.body.detail}`);
    }
    throw new Error(`An error occurred while communicating with Mailchimp.`);
}


export async function addSubscriber(email: string): Promise<void> {
    const listId = process.env.MAILCHIMP_AUDIENCE_ID;

    if (!listId || !process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
        console.error("Mailchimp environment variables are not set. Cannot add subscriber.");
        throw new Error("La integración con el servicio de newsletter no está configurada.");
    }
    
    try {
        await mailchimp.lists.setListMember(listId, email.toLowerCase(), {
            email_address: email,
            status: "subscribed",
        });
        console.log(`Successfully added ${email} to Mailchimp list.`);

    } catch (error: any) {
        if (error.status === 400 && error.response?.body?.title === "Member Exists") {
             throw new Error("Este email ya está suscripto.");
        }
        handleApiError(error, 'adding a subscriber');
    }
}

// This function is no longer needed as subscribers are managed in Mailchimp.
// It is kept here for reference or if you decide to switch back to a local database.
export async function getSubscribers(): Promise<Subscriber[]> {
    console.warn("getSubscribers is a stub function. Subscribers are managed in Mailchimp.");
    return Promise.resolve([]);
}
