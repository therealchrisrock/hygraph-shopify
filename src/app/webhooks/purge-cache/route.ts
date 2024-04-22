import {NextRequest} from "next/server";
import {purge} from "@/app/api/purge-cache/purge";

export const POST = async (
    request: NextRequest,
    {params}: { params: { slug: string } }
) => {
    try {
        const res = await purge()
        if (!res.ok) {
            throw new Error('Failed to purge cache for key, `lastModified`.');
        }
        return new Response(res.body, {status: 200})
    } catch (error) {
        // @ts-ignore
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        })
    }
}



