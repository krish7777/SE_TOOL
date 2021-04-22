'use strict';
import { Disposable, Terminal, window } from 'vscode';

let _terminal: Terminal | undefined;
let _terminalCwd: string | undefined;
let _disposable: Disposable | undefined;

const extensionTerminalName = 'Krishterm';

/* Ensure the terminal is present otherwise create a new one */
function ensureTerminal(cwd: string): Terminal {
    if (_terminal === undefined) {
        _terminal = window.createTerminal(extensionTerminalName);
        _disposable = window.onDidCloseTerminal((e: Terminal) => {
            if (e.name === extensionTerminalName) {
                _terminal = undefined;
                _disposable!.dispose();
                _disposable = undefined;
            }
        });

        _terminalCwd = undefined;
    }
    return _terminal;
}


/* A function to spawn a hidden terminal and run the given command */
export function runGitCommandInTerminal(command: string, cwd: string) {
    const terminal = ensureTerminal(cwd);
    terminal.show(false);
    terminal.hide();
    terminal.sendText(command, true);
}