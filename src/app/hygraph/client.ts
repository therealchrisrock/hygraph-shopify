import {GraphQLClient} from "graphql-request";
import {
    CollectionCreateInput,
    CollectionUpdateInput, CollectionUpsertInput,
    getSdk,
    ProductCreateInput,
    ProductUpdateInput, ProductUpsertInput
} from "@/__generated__/hygraph-contentapi.generated";
import {JsonObject} from "type-fest";

export class HygraphHelper {
    private client: GraphQLClient;
    private sdk: ReturnType<typeof getSdk>;
    constructor(url: string, token: string) {
        this.client = this.createClient(url, token)
        this.sdk = getSdk(this.client)
    }
    private createClient(url: string, token: string) {
        return new GraphQLClient(url, {
            fetch,
            headers: {
                Authorization: process.env.HYGRAPH_CONTENT_TOKEN as string
            }
        })
    }
    public async getProduct(gid: string) {
        try {
            const {product} = await this.sdk.GetProduct({where: {gid}})
            return product
        } catch (e) {
            console.error('error fetching product from hygraph', e)
        }
    }

    public async upsertProduct(gid: string, upsert: ProductUpsertInput) {
        try {
            const {upsertProduct} = await this.sdk.UpsertProduct({
                where: {gid},
                upsert
            })
            console.log('product successfully upserted')
            return {status: "success", data: upsertProduct}
        } catch (e) {
            console.log(e)
            console.error('failed to upsert product')
            return {status: "error"}
        }
    }
    public async migrateProduct(line: string) {
        const data = JSON.parse(line);
        const {id: gid, title, handle: slug, legacyResourceId} = data;
        if (!gid) {
            console.warn('GID not found on json line. Skipping...')
            return
        }
        const payload = {gid, title, slug, legacyResourceId: String(legacyResourceId)}
        return await this.upsertProduct(gid, {
            create: payload,
            update: payload
        })
    }
    public async publishProducts(ids: string[]) {

    }
    public async createProduct(data:ProductCreateInput) {
        try {
            const mutation = this.sdk.CreateProduct({data})
            return {status: "success", data: mutation}
        } catch (e) {
            console.error('failed to create product', e)
            return {status: "error"}
        }

    }
    public async updateProduct(gid: string, data:ProductUpdateInput) {
        try {
            const mutation = this.sdk.UpdateProduct({
                where: {gid}, data
            })
            return {status: "success", data: mutation}
        } catch (e) {
            console.error('failed to update product', e)
            return {status: "error"}
        }

    }
    public async deleteProduct(gid: string) {
        try {
            const {deleteProduct}  = await this.sdk.DeleteProduct({where: {gid}})
            console.log('product successfully deleted', deleteProduct)
            return {status: "success", data: deleteProduct}
        } catch (e) {
            console.error('failed to delete product', e)
            return {status: "error"}
        }
    }
    public async migrateCollection(line: string) {
        const data = JSON.parse(line);
        const {id: gid, title, handle: slug, legacyResourceId} = data;
        if (!gid) {
            console.warn('GID not found on json line for collection. Skipping...')
            return
        }
        const payload = {gid, title, slug, legacyResourceId: String(legacyResourceId)}

        await this.upsertCollection(gid, {
            update: payload,
            create: payload
        })
    }
    public async upsertCollection(gid: string, upsert: CollectionUpsertInput) {
        try {
            const {upsertCollection} = await this.sdk.UpsertCollection({
                where: {gid},
                upsert
            })
            console.log('colletion successfully upserted')
            return {status: "success", data: upsertCollection}
        } catch (e) {
            console.log(e)
            console.error('failed to upsert product')
            return {status: "error"}
        }
    }
    public async createCollection(data:CollectionCreateInput) {
        try {
            const mutation = this.sdk.CreateCollection({data})
            return {status: "success", data: mutation}
        } catch (e) {
            console.error('failed to create product', e)
            return {status: "error"}
        }

    }
    public async updateCollection(gid: string, data:CollectionUpdateInput) {
        try {
            const mutation = this.sdk.UpdateCollection({
                where: {gid}, data
            })
            return {status: "success", data: mutation}
        } catch (e) {
            console.error('failed to update product', e)
            return {status: "error"}
        }

    }
    public async deleteCollection(gid: string) {
        try {
            const {deleteCollection} = await this.sdk.DeleteCollection({where: {gid}})
            console.log('Collection successfully delete')
            console.log(deleteCollection)
            return {status: "success", data: deleteCollection}
        } catch (e) {
            console.error('failed to delete product', e)
            return {status: "error"}
        }
    }
}
export const hygraph = new HygraphHelper(process.env.HYGRAPH_CONTENT_URL as string, process.env.HYGRAPH_CONTENT_TOKEN as string)