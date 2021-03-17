/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.checkFileNames = exports.activate = void 0;
const vscode = __webpack_require__(1);
const terminal_1 = __webpack_require__(2);
const path_1 = __webpack_require__(3);
const { exec } = __webpack_require__(4);
let technologiesUsed = [];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "github-documenter" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('github-documenter.generateReport', () => __awaiter(this, void 0, void 0, function* () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        if (!vscode.workspace.workspaceFolders) {
            return vscode.window.showInformationMessage('No folder or workspace opened');
        }
        vscode.window.showInformationMessage('Please Enter the Github Repository name');
        let ud = yield vscode.window.showInputBox();
        let folderUri = vscode.workspace.workspaceFolders[0].uri;
        ud && vscode.window.showInformationMessage(folderUri.path);
        yield checkFileNames(folderUri);
        console.log(technologiesUsed);
        if (technologiesUsed.includes("React"))
            console.log("MERN Stack");
        if (technologiesUsed.includes("Angular") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express"))
            console.log("MEAN Stack");
        if (technologiesUsed.includes("Vue") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express"))
            console.log("MEVN Stack");
        // exec('pwd', (err: any, stdout: any, stderr: any) => {
        // 	if (err) {
        // 		//some err occurred
        // 		console.error(err)
        // 	} else {
        // 		// the *entire* stdout and stderr (buffered)
        // 		console.log(`stdout: ${stdout}`);
        // 		console.log(`stderr: ${stderr}`);
        // 	}
        // });
        terminal_1.runGitCommandInTerminal('git branch -a >> yoo3.txt', folderUri.path);
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function checkFileNames(folderUri) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const [name, type] of yield vscode.workspace.fs.readDirectory(folderUri)) {
            if (type == vscode.FileType.Directory && name != "node_modules") {
                yield checkFileNames(folderUri.with({ path: path_1.posix.join(folderUri.path, name) }));
            }
            else {
                //console.log(name + " - " + type);
                if (name == "package.json") {
                    let packagePath = folderUri.with({ path: path_1.posix.join(folderUri.path, name) });
                    const packageBuffer = yield vscode.workspace.fs.readFile(packagePath);
                    const packageText = packageBuffer.toString();
                    // console.log(allTechnologies)
                    // allTechnologies.forEach(tech => {
                    // 	if (packageText.includes(tech)) {
                    // 		console.log(tech)
                    // 		technologiesUsed.push(tech);
                    // 	}
                    // });
                    if (packageText.includes("react")) {
                        console.log("React");
                        technologiesUsed.push("React");
                    }
                    if (packageText.includes("antd")) {
                        console.log("Antd");
                        technologiesUsed.push("Antd");
                    }
                    if (packageText.includes("angular")) {
                        console.log("Angular");
                        technologiesUsed.push("Angular");
                    }
                    if (packageText.includes("vue")) {
                        console.log("Vue");
                        technologiesUsed.push("Vue");
                    }
                    if (packageText.includes("mongo")) {
                        console.log("MongoDB");
                        technologiesUsed.push("MongoDB");
                    }
                    if (packageText.includes("sql")) {
                        console.log("SQL");
                        technologiesUsed.push("SQL");
                    }
                    if (packageText.includes("express")) {
                        console.log("Express");
                        technologiesUsed.push("Express");
                    }
                }
            }
        }
    });
}
exports.checkFileNames = checkFileNames;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.runGitCommandInTerminal = void 0;
const vscode_1 = __webpack_require__(1);
let _terminal;
let _terminalCwd;
let _disposable;
const extensionTerminalName = 'Krishterm';
function ensureTerminal(cwd) {
    if (_terminal === undefined) {
        _terminal = vscode_1.window.createTerminal(extensionTerminalName);
        _disposable = vscode_1.window.onDidCloseTerminal((e) => {
            if (e.name === extensionTerminalName) {
                _terminal = undefined;
                _disposable.dispose();
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
function runGitCommandInTerminal(command, cwd) {
    const terminal = ensureTerminal(cwd);
    terminal.show(false);
    terminal.hide();
    terminal.sendText(command, true);
    //terminal.dispose();
}
exports.runGitCommandInTerminal = runGitCommandInTerminal;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");;

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("child_process");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map