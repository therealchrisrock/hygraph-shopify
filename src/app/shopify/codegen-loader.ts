import fetch from 'cross-fetch'
import { getIntrospectionQuery, buildClientSchema } from 'graphql'

export default async () => {
    const introspectionQuery = getIntrospectionQuery()

    const response = await fetch(process.env.SHOP_URL as string, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOP_TOKEN as string
        },
        body: JSON.stringify({ query: introspectionQuery })
    })

    const data = await response.json()

    return buildClientSchema(data.data)
}