'use strict';
import { Disposable, Terminal, window } from 'vscode';

let _terminal: Terminal | undefined;
let _terminalCwd: string | undefined;
let _disposable: Disposable | undefined;

const extensionTerminalName = 'Krishterm';

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

    // if (_terminalCwd !== cwd) {
    //     _terminal.sendText(`cd "${cwd}"`, true);
    //     _terminalCwd = cwd;
    // }

    return _terminal;
}

export function runGitCommandInTerminal(command: string, cwd: string) {


    const terminal = ensureTerminal(cwd);
    terminal.show(false);
    terminal.hide();
    terminal.sendText(command, true);
    //terminal.dispose();
}