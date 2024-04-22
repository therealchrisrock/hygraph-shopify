import {headers} from "next/headers";
import {purge} from "@/app/api/purge-cache/purge";

export async function GET() {
    const headersList = headers()
    if (headersList.get('Authorization') !== process.env.APP_TOKEN) {
        return new Response("Could not authenticate request to purge cache",{status: 401})
    }
    try {
        const res = await purge()
        if (!res.ok) {
            throw new Error('Failed to purge cache for key, `lastModified`.');
        }
        return new Response(res.body, {status: 200})
    } catch (e) {
        console.error(e)
    }

}