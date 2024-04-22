import {NextRequest, NextResponse} from "next/server";
import invariant from "tiny-invariant";
import {shopify} from "@/app/shopify/shopifyClient";
import {hygraph} from "@/app/hygraph/client";

export const config = {
    matcher: ['/webhooks/collection/:slug', '/webhooks/product/:slug', '/webhooks/purge-cache'],
}
export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/webhooks/purge-cache') {
        console.log('purge cache')
        const gcms = request.headers.get('gcms-signature')
        if (!gcms) {
            return Response.json(
                { success: false, message: 'verification failed. No GCMS signature included in request header' },
                { status: 401 }
            )
        }
        const isVerified = hygraph.verifyWebhookSignature(gcms, request.body);
        if (!isVerified){
            return Response.json(
                { success: false, message: 'Failed to verify Webhook signature.' },
                { status: 401 }
            )
        }
    } else {
        const shopifySecret = process.env.WEBHOOK_SIG as string;
        invariant(shopifySecret, "Shopify Admin API Token (WEBHOOK_SIG) is not defined")
        const { verified, topic, domain, body } = await shopify.verifyWebhook(
            request,
            shopifySecret
        );
        if (!verified) {
            return Response.json(
                { success: false, message: 'verification failed' },
                { status: 401 }
            )
        }
    }
    return NextResponse.next()
}