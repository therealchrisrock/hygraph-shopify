import {GraphQLClient} from "graphql-request";
import {getSdk, WebhookSubscriptionTopic} from "@/__generated__/shopify-adminapi.generated";
import {NextRequest} from "next/server";
import {WebhookHeader} from "@/app/webhooks/types";
import crypto from "crypto";
import invariant from "tiny-invariant";

import {sleep} from "@/lib/utils";

const MAX_TIMEOUT = 600 * 1000
const POLL_INTERVAL = 5 * 1000

export const shopifyAdminClient: GraphQLClient = new GraphQLClient(process.env.SHOP_URL as string, {
    fetch,
    headers: {
        'X-Shopify-Access-Token': process.env.SHOP_TOKEN as string
    },
});

class ShopifyHelper {
    private client: GraphQLClient;
    private sdk: ReturnType<typeof getSdk>;
    readonly callbacks = {
        collection: {
            create: '/webhooks/collection/create',
            update: '/webhooks/collection/update',
            delete: '/webhooks/collection/delete'
        },
        product: {
            create: '/webhooks/product/create',
            update: '/webhooks/product/update',
            delete: '/webhooks/product/delete'
        }
    }
    public bulkProductQuery = `{
        products(query:"-status=closed") {
            edges {
                node {
                    id
                    title
                    handle
                    descriptionHtml
                    legacyResourceId
                }
            }
        }
    }
   `
    public bulkCollectionQuery = `{
        collections {
            edges {
                node {
                    id
                    title
                    handle
                    descriptionHtml
                    legacyResourceId
                }
            }
        }
    }
   `
    constructor(url: string, token: string) {
        this.client = this.createClient(url, token)
        this.sdk = getSdk(this.client)
    }

    private createClient(url: string, token: string) {
        return new GraphQLClient(url, {
            fetch,
            headers: {
                'X-Shopify-Access-Token': token
            },
        });
    }

    private async subscribeToCollections() {
        try {
            const create = await this.subscribe(WebhookSubscriptionTopic.CollectionsCreate, this.callbacks.collection.create)
            const update = await this.subscribe(WebhookSubscriptionTopic.CollectionsUpdate, this.callbacks.collection.update)
            const del = await this.subscribe(WebhookSubscriptionTopic.CollectionsDelete, this.callbacks.collection.delete)
            return {create, update, del}
        } catch (e) {
            console.warn(e)
        }
        return 1;
    }
    private async subscribeToProducts() {
        try {
            const create = await this.subscribe(WebhookSubscriptionTopic.ProductsCreate, this.callbacks.product.create)
            const update = await this.subscribe(WebhookSubscriptionTopic.ProductsUpdate, this.callbacks.product.update)
            const del = await this.subscribe(WebhookSubscriptionTopic.ProductsDelete, this.callbacks.product.delete)
            return {create, update, del}
        } catch (e) {
            console.warn(e)
        }
        return 1;
    }
    private async subscribe(topic: WebhookSubscriptionTopic, callbackUrl: string) {
        try {
            const {webhookSubscriptionCreate: webhook} = await this.sdk.CreateWebhook({topic, callbackUrl})
            if (webhook?.userErrors) {
                console.warn(webhook.userErrors)
            }
            return webhook?.webhookSubscription?.id
        } catch (e) {
            console.warn(`there was an error creating a webhook subscription (${topic}): `,e)
        }
    }
    public async createWebhooks() {
        try {
            this.subscribeToProducts()
            this.subscribeToCollections()
        } catch (e) {
            console.warn(e)
        }
    }
    public async verifyWebhook(
        req: NextRequest,
        shopifySecret: string
    ) {
        const hmac =
            req.headers.get(WebhookHeader.Hmac) ??
            req.headers.get(WebhookHeader.Hmac.toLowerCase());
        const topic =
            req.headers.get(WebhookHeader.Topic) ??
            req.headers.get(WebhookHeader.Topic.toLowerCase());
        const domain =
            req.headers.get(WebhookHeader.Domain) ??
            req.headers.get(WebhookHeader.Domain.toLowerCase());

        const rawBody = await req.text()

        const hash = crypto
            .createHmac('sha256', shopifySecret)
            .update(rawBody)
            .digest('base64');

        return {
            verified: hash === hmac,
            topic,
            domain,
            body: JSON.parse(rawBody)
        }
    }
    async pollBulkOperation(elapsed: number = 0, interval = POLL_INTERVAL, max = MAX_TIMEOUT): Promise<string | null> {
        if (elapsed > max) {
            console.warn('Polling for bulk operation run query has timed-out')
            return null
        }
        const {currentBulkOperation} = await this.sdk.CurrentBulkOperation()
        if (currentBulkOperation?.status === 'COMPLETED')
            return currentBulkOperation.url
        await sleep(interval)
        return await this.pollBulkOperation(elapsed + interval)

    }
    public async fetchProducts() {
        const {collection: shopAll} = await getSdk(shopifyAdminClient).GetShopifyCollection({id: process.env.SHOP_ALL_COLL_ID as string})
        invariant(shopAll, `Shop ALL collection not found during migration (${process.env.SHOP_ALL_COLL_ID})`)
        const flattenedShopAll = shopAll.products.edges.map((c) => c.node);
        invariant(flattenedShopAll, `No products found in the shop ALL collection during migration (${process.env.SHOP_ALL_COLL_ID})`)
        return flattenedShopAll;
    }
    public async createBulkQuery(query: string) {
        try {
            const {bulkOperationRunQuery}= await this.sdk.BulkOperationRunQuery({query})
            if (!bulkOperationRunQuery || bulkOperationRunQuery.userErrors.length) {
                console.error(bulkOperationRunQuery)
                throw new Error('Error occurred during bulk operation run query');
            }
            const url = await this.pollBulkOperation()
            if (!url) return
            return url;
        } catch (e) {
            console.error(e)
            return
        }
    }
}

export const shopify = new ShopifyHelper(process.env.SHOP_URL as string, process.env.SHOP_TOKEN as string)
