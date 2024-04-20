import {Maybe} from "@graphql-tools/utils";

export enum WebhookActions {
    Create = 'create',
    Update = 'update',
    Remove = 'remove'
}
export enum WebhookHeader {
    Hmac = 'X-Shopify-Hmac-Sha256',
    Topic = 'X-Shopify-Topic',
    Domain = 'X-Shopify-Shop-Domain'
}
export interface VerifiedWebhook {
    verified: boolean;
    topic: Maybe<string | string[]>;
    domain: Maybe<string | string[]>;
    body: Record<string, unknown>;
}
