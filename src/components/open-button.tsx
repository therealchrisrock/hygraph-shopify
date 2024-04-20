import {Button} from "@/components/ui/button";
import React, {ReactNode} from "react";

export function OpenButton({handleOpenDialog, children}: {handleOpenDialog: () => void, children: ReactNode}) {
    return <Button onClick={handleOpenDialog}>{children}</Button>;
}
