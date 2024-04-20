"use client"

import {useApp, Wrapper} from "@hygraph/app-sdk-react";
import {Form, Formik} from "formik";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import React from "react";

type Config = {}


function ConfigureForm() {
    const { updateInstallation, installation,  } = useApp();
    const {config: init} = installation
    const initialValues: Config = {}


    return (
        <Formik
            initialValues={initialValues}
            onSubmit={async (values, actions) => {
                actions.setSubmitting(true);
                const {status} = await updateInstallation({ status: "COMPLETED", config: values })
                if (status === "COMPLETED") return actions.setSubmitting(false);
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Spinner />
                        ) : installation.status !== "COMPLETED" ? 'Install' : 'Update'}
                    </Button>
                </Form>
            )}
        </Formik>
    );
}

export default function Configure() {
    return (
        <Wrapper>
            <ConfigureForm />
        </Wrapper>
    )
}