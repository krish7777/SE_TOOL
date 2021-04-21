const axios = require('axios');

import * as vscode from 'vscode';

export class AutoDocstring {
    private editor: vscode.TextEditor;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }

    public generateDocstring(): Thenable<boolean> {
        if (this.editor == undefined) {
            throw new Error('Some error occured')
        }

        const selection = this.editor.selection
        const document = this.editor.document;

        console.log("starting line", selection.start.line)

        const sentences = document.getText(selection);
        const insertPosition = selection.start.with(undefined, 0)

        if (sentences.length > 0) {
            const insertSnippet = "\t#The docstring is being processed!. Please wait\n"
            const snippetRange = new vscode.Range(insertPosition.line, 0, insertPosition.line + 1, 0);

            const success = this.editor.insertSnippet(new vscode.SnippetString(insertSnippet), insertPosition)
            console.log("selection", sentences)
            console.log("pos1 ", insertPosition)

            success.then(() => {
                axios.post("http://127.0.0.1:5000/summary", {
                    code: sentences
                })
                    .then((res: any) => {
                        // const summary = res.data.message;
                        const response = res.data
                        if (response && response["message"] && response["message"].length) {
                            let summary = response["message"][0];
                            console.log(summary)
                            this.editor.edit(editBuilder => {
                                editBuilder.replace(snippetRange, "#" + summary + "\n");
                            })
                        }

                    })
                    .catch((err: any) => {
                        console.log(err)
                    })
            })


        } else {
            throw new Error("Please select the entire body of the function")
        }

    }
}