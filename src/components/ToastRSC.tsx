'use client'
import {useApp, Wrapper} from "@hygraph/app-sdk-react";
import React, {ReactNode} from "react";

export type ShowToast = (options: ToastOptions) => Promise<Id>;

export type ToastOptions = {
    title: string;
    description?: string;
    variantColor: keyof typeof ToastVariantColor;
    id?: Id;
    isClosable?: boolean;
    position?: keyof typeof ToastPosition;
    duration?: number;
};

type Id = number | string;

export const ToastVariantColor = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    primary: 'primary',
    dark: 'dark',
    publish: 'publish',
} as const;

export const ToastPosition = {
    'top-right': 'top-right',
    'top-center': 'top-center',
    'top-left': 'top-left',
    'bottom-right': 'bottom-right',
    'bottom-center': 'bottom-center',
    'bottom-left': 'bottom-left',
} as const;

export function ExposeHygraphCtxToRSC({children}: {children: ReactNode}) {
    return (
        <Wrapper>
            {children}
        </Wrapper>
    )
}
export function ServerToast(options: ToastOptions) {
    function ClientToast() {
        const {showToast} = useApp()
        showToast(options)
        return null
    }
    return (
        <ExposeHygraphCtxToRSC>
            <ClientToast />
        </ExposeHygraphCtxToRSC>
    )
}