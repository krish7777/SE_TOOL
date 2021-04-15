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
            const insertSnippet = "\tHello docstring is being processed. Please wait\n"
            const snippetRange = new vscode.Range(insertPosition.line, 0, insertPosition.line + 1, 0);

            const success = this.editor.insertSnippet(new vscode.SnippetString(insertSnippet), insertPosition)
            console.log("selection", sentences)
            console.log("pos1 ", insertPosition)

            success.then(() => {
                axios.post("http://127.0.0.1:5000/summary", {
                    code: sentences
                })
                    .then(res => {
                        // const summary = res.data.message;
                        const response = res.data
                        if (response && response.length) {
                            let summary = response[0].summary_text
                            console.log(summary)
                            this.editor.edit(editBuilder => {
                                editBuilder.replace(snippetRange, "#" + summary + "\n");
                            })
                        }

                    })
                    .catch(err => {
                        console.log(err)
                    })
            })


        } else {
            throw new Error("Please select the entire body of the function")
        }


    }
}