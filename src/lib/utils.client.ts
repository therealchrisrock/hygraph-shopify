import {Key, useCallback, useEffect, useState} from "react";
import {Maybe} from "@/__generated__/shopify-adminapi.generated";
import {typedFetch} from "typed-route-handler/client";

export function useOnKeyPress(key: Key, cb: () => void) {
    const escFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === key) {
            //Do whatever when esc is pressed
            cb()
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false);

        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [escFunction]);
}

export function useTypedFetch<T>(url: string) {
    const [data, setData] = useState<Maybe<T>>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await typedFetch<T>(url);
                setData(response);
            } catch (error) {
                console.error('An error occurred:', error);
            }
            setLoading(false);
        }

        fetchData();

        // Cleanup if needed
        return () => {
            // Unsubscribe or cancel polling here
        };
    }, []); // Empty dependency array ensures effect only runs once
    return {
        data,
        loading
    }
}