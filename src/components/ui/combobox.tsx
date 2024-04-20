// declare your dialog options and return types
import {useUiExtensionDialog} from "@hygraph/app-sdk-react";
import {OpenDialog} from "@hygraph/app-sdk/src/type-helpers/dialog";
import {useState} from "react";


type DialogProps = { question: string };
type DialogReturn = string;

function Button() {
    const handleOpenDialog = () =>
        openDialog<DialogReturn, DialogProps>(
            'dialog',
            { question: 'what ?' } // vlidated by typescript
        ).then((answer) => {
            // `answer` is of type `string` instead of `any`
        });
    return <button onClick={handleOpenDialog}>Open question</button>;
}

function Dialog() {
    const { onCloseDialog, question } = useUiExtensionDialog<
        DialogReturn,
        DialogProps
    >();
    const [answer, setAnswer] = useState<DialogReturn>('');
    const onCancel = () => onCloseDialog(null);
    const onSubmit = () => onCloseDialog(answer);
    return (
        <div>
            <h2>{question}</h2>
            <input onChange={(e) => setAnswer(e.target.value)} value={answer} />
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onSubmit}>Submit</button>
        </div>
    );
}