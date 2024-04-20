import {NextRequest} from "next/server";
import {hygraph} from "@/app/hygraph/client";

export const POST = async (
    request: NextRequest,
    {params}: { params: { slug: string } }
) => {
    try {
        const res = await request.json()
        console.log(res)
        const {admin_graphql_api_id:gid, handle: slug, title, id} = res
        if (params.slug === "create" || params.slug === 'update') {
            await hygraph.upsertProduct(gid, {
                create: {gid, title, slug, legacyResourceId: String(id)},
                update: {gid, title, slug, legacyResourceId: String(id)}
            })
        }
        if (params.slug === 'delete') {
            await hygraph.deleteProduct(gid)
        }
        console.log(res)
    } catch (error) {
        // @ts-ignore
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        })
    }

    return new Response('Success!', {
        status: 200,
    })
}



