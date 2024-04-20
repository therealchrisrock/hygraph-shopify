
import {shopify} from "@/app/shopify/shopifyClient";
import { createInterface } from 'readline';
import { Readable } from 'stream';
import {hygraph} from "@/app/hygraph/client";
import Bottleneck from "bottleneck";

async function migrateProducts() {
    const url = await shopify.createBulkQuery(shopify.bulkProductQuery);
    if (!url) {
        console.error("no response from bulk operation run query")
        return
    }
    await processJsonLines(url, async (line: string) => await hygraph.migrateProduct(line))
}

async function migrateCollections() {
    const url = await shopify.createBulkQuery(shopify.bulkCollectionQuery);
    console.log(url)
    if (!url) {
        console.error("no response from bulk operation run query")
        return
    }
    await processJsonLines(url, async (line: string) => await hygraph.migrateCollection(line))
}
export async function migrateAll() {
    "use server"
  //  await migrateProducts()
    await migrateCollections();
    return
}


// Define the type for a JSON object
type JsonObject = { [key: string]: any };

async function processJsonLines(url: string, onLine: (line: string) => Promise<any>, onEnd?: (ids: string[]) => Promise<any>): Promise<void> {
    const limiter = new Bottleneck({
        reservoir: 4, // initial value
        reservoirRefreshAmount: 4,
        reservoirRefreshInterval: 1000, // must be divisible by 250
        // also use maxConcurrent and/or minTime for safety
        maxConcurrent: 1,
        minTime: 333 // pick a value that makes sense for your use case
    });
    const ids: string[] = []
    try {
        const response = await fetch(url);
        if (!response.ok || !response.body) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        // Convert the ReadableStream (from fetch) to a Node.js Readable stream
        const reader = response.body.getReader();
        const stream = new Readable({
            read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        this.push(null); // Signal end of stream
                    } else {
                        this.push(Buffer.from(value)); // Push data chunk
                    }
                }).catch(err => {
                    this.emit('error', err);
                });
            }
        });

        const readlineInterface = createInterface({
            input: stream,
            crlfDelay: Infinity // Handle CRLF and LF line breaks
        });
        readlineInterface.on('line', async (line: string) => {
            try {
                // Perform your operation with the json object here
                // cb(json)
                limiter.schedule(() => onLine(line)).then((result) => {
                    if (result?.data?.id) ids.push(result.data.id)
                })
            } catch (e) {
                console.error('Error parsing JSON line:', e);
            }
        });

        readlineInterface.on('close', () => {
            console.log('Finished processing all lines');
            if (onEnd)
                limiter.schedule(() => onEnd(ids))
        });

    } catch (error) {
        console.error('Error fetching or processing file:', error);
    }
}

// function sortCollections(shopifyCollections: CollectionFragment[], hygraphCollections: GetHygraphCollectionsQuery['collections']) {
//     // Create a set of gids from hygraphCollections for quick lookup
//     const gids = new Set(hygraphCollections.map(hc => hc.gid));
//
//     // Filter existingCollections
//     const existingCollections = shopifyCollections.filter(sc => gids.has(sc.id));
//
//     // Filter newCollections
//     const newCollections = shopifyCollections.filter(sc => !gids.has(sc.id));
//
//     return { existingCollections, newCollections };
// }
// async function migrateCollections() {
//     const {collections: shopifyCollections} = await getSdk(shopifyAdminClient).GetShopifyCollections()
//     const {collections: hygraphCollections} = await getHygraphSdk(hygraphContentCient).GetHygraphCollections()
//     const flattenedShopCollections = shopifyCollections.edges.map((c) => c.node)
//     invariant(flattenedShopCollections, "No Shopify Collections found.")
//     const {existingCollections, newCollections} = sortCollections(flattenedShopCollections, hygraphCollections)
// }
// async function migrateProducts() {
//     const {collection: shopAll} = await getSdk(shopifyAdminClient).GetShopifyCollection({id: process.env.SHOP_ALL_COLL_ID as string})
//     invariant(shopAll, `Shop ALL collection not found during migration (${process.env.SHOP_ALL_COLL_ID})`)
//     const flattenedShopAll = shopAll.products.edges.map((c) => c.node);
//     invariant(flattenedShopAll, `No products found in the shop ALL collection during migration (${process.env.SHOP_ALL_COLL_ID})`)
//     const hygraphProducts = await fetchAllHygraphProducts()
//
// }
// async function fetchAllHygraphProducts(after: string | null = null, allProducts: Pick<Product, "id" | 'gid'>[] = []): Promise<Pick<Product, "id" | 'gid'>[]> {
//     const {productsConnection} = await getHygraphSdk(hygraphContentCient).GetHygraphProducts({after})
//     const products = productsConnection.edges.map(edge => edge.node);
//     allProducts.push(...products);
//     const {hasNextPage, endCursor} = productsConnection.pageInfo
//     if (hasNextPage && endCursor) {
//         return fetchAllHygraphProducts(endCursor, allProducts);
//     } else {
//         return allProducts;
//     }
// }
// async function getPaginatedResults(conn: GetHygraphProductsQuery['productsConnection'], products: Pick<Product, 'id' | 'gid'>[]) {
//     if (conn.pageInfo.hasNextPage) {
//
//     }
//
// }