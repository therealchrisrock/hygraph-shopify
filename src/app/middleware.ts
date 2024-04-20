import {NextRequest, NextResponse} from "next/server";
import invariant from "tiny-invariant";
import {shopify} from "@/app/shopify/shopifyClient";

export const config = {
    matcher: ['/webhooks/collection/:slug', '/webhooks/product/:slug'],
}
export async function middleware(request: NextRequest) {
    const shopifySecret = process.env.WEBHOOK_SIG as string;
    invariant(shopifySecret, "Shopify Admin API Token (WEBHOOK_SIG) is not defined")
    const { verified, topic, domain, body } = await shopify.verifyWebhook(
        request,
        shopifySecret
    );
    console.log('middleware', verified)
    if (!verified) {
        return Response.json(
            { success: false, message: 'verification failed' },
            { status: 401 }
        )
    }

    return NextResponse.next()
}