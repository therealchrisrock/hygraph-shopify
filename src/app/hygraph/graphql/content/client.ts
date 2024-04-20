import {GraphQLClient} from "graphql-request";

export const hygraphContentCient: GraphQLClient = new GraphQLClient(process.env.HYGRAPH_CONTENT_URL as string, {
    fetch,
    headers: {
        Authorization: `Bearer ${process.env.HYGRAPH_CONTENT_TOKEN}`
    },
});