import { NextRequest, NextResponse } from 'next/server';

// This API route is disabled because the application is configured for static export.
// A secure payment integration requires a server-side environment (like a Node.js server)
// to protect sensitive API keys.
//
// To enable this functionality, you would need to:
// 1. Switch to a hosting provider that supports Node.js.
// 2. Remove the `output: 'export'` option from `next.config.ts`.
// 3. Implement the server-side logic to create a payment preference
//    using the Mercado Pago SDK with a secure access token.

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This functionality is disabled in static export mode. A server is required for secure payment processing.' 
    }, 
    { status: 501 } // 501 Not Implemented
  );
}
