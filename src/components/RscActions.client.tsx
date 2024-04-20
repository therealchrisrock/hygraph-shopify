'use client'

import {Button} from "@/components/ui/button";
import {ReactNode} from "react";
import { useFormStatus } from "react-dom";
import {Spinner} from "@/components/ui/spinner";


export function SubmitButton({children}: {children: ReactNode}) {
    'use client'
    const { pending } = useFormStatus()
    return <Button type={'submit'} disabled={pending}>{pending ? <Spinner />: children}</Button>
}