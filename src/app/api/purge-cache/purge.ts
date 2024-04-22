export async function purge() {
    return await fetch(process.env.KV_URL + '/set', {
        headers: {
            Authorization: process.env.WORKERS_KV_TOKEN as string
        }
    })
}