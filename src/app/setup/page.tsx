import React from "react";
import Configure from "@/app/setup/configure";
import {Button} from "@/components/ui/button";
import {shopify} from "@/app/shopify/shopifyClient";
import {SubmitButton} from "@/components/RscActions.client";
import * as fs from "fs";
import {migrateAll} from "@/app/setup/migrate";


export default function SetupElement() {
    async function flushCache() {
        "use server"

    }


    return (
        <section className={'prose lg:prose-xl '}>
            <Summary />
            <div className={'pt-4 flex gap-4'}>
                <Configure/>
                <form action={migrateAll}>
                    <SubmitButton>Migrate Shopify Data</SubmitButton>
                </form>
                <form action={flushCache}>
                    <Button variant={'destructive'}>Flush Cache</Button>
                </form>
            </div>
        </section>
    )
}

// function ShopifyMigration() {
//
//     return (
//         <Button>Migrate Shopify Catalogue</Button>
//     )
// }
function Summary() {
    return (
        <div className={'prose lg:prose-xl'}>
            <h1>Shopify Sync</h1>
            <p>
                This app contains utilities to improve the UX for using Hygraph with Shopify.
            </p>
            {/*<ol>*/}
            {/*    <li>1. Shop Remote Source integration</li>*/}
            {/*</ol>*/}
        </div>
    )
}
