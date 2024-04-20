"use client"
import {useUiExtensionDialog} from "@hygraph/app-sdk-react";
import React, {SyntheticEvent, useCallback, useEffect, useState} from "react";
import { CheckIcon } from "@radix-ui/react-icons"

import {cn} from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem, CommandList,
} from "@/components/ui/command"
import {CollectionFragment} from "@/__generated__/shopify-adminapi.generated";
import {CollectionSelectorDialogProps, CollectionSelectorDialogReturn} from "@/app/fields/collection-selector/page";
import {useOnKeyPress} from "@/lib/utils.client";


export default function ClientCollectionSelector({collections}: {collections: CollectionFragment[]}) {
    const { onCloseDialog, collection } = useUiExtensionDialog<
        CollectionSelectorDialogReturn,
        CollectionSelectorDialogProps
    >();

    const onCancel = () => onCloseDialog(null);
    const onSubmit = () => onCloseDialog(value);
    useOnKeyPress('Escape', onCancel)


    const [value, setValue] = useState<CollectionSelectorDialogReturn>(collection ?? null);
    const [selectionMade, setSelectionMade] = useState(false)
    const [search, setSearch] = useState('')
    useEffect(() => {
        if (value && selectionMade) onSubmit()
    }, [value, selectionMade]);

    return (
        <div className={'p-2 rounded'}>
            <Command value={search} onValueChange={setSearch}>
                <CommandInput autoFocus placeholder="Search collections..." className="h-9" />
                <CommandList>
                    <CommandEmpty>No collection found.</CommandEmpty>
                    {collections.map((collection) => (
                        <CommandItem
                            key={collection.id}
                            value={collection.title}
                            onClick={(currentValue) => {
                                setSelectionMade(true)
                                setValue(collection)
                            }}
                            className={'cursor-pointer'}
                            onSelect={(currentValue) => {
                                setSelectionMade(true)
                                setValue(collection)
                            }}
                        >
                            {collection.title}
                            <CheckIcon
                                className={cn(
                                    "ml-auto h-4 w-4",
                                    value?.id === collection.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                        </CommandItem>
                    ))}
                </CommandList>
            </Command>
        </div>
    );
}

