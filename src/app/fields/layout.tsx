"use client"

import {Wrapper} from "@hygraph/app-sdk-react";
import {ReactNode} from "react";

export default function FieldsLayout({ children }: {children: ReactNode}) {
    return (
        <Wrapper>
            {children}
        </Wrapper>
    )
}