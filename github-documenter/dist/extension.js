/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const vscode = __importStar(__webpack_require__(1));
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
        let stackUsed = '';
        let domain = '';
        if (technologiesUsed.includes("React") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express")) {
            console.log("MERN Stack");
            stackUsed = 'MERN Stack';
            domain = "Web Application";
        }
        if (technologiesUsed.includes("Angular") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express")) {
            console.log("MEAN Stack");
            stackUsed = 'MEAN Stack';
            domain = "Web Application";
        }
        if (technologiesUsed.includes("Vue") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express")) {
            console.log("MEVN Stack");
            stackUsed = 'MEVN Stack';
            domain = "Web Application";
        }
        if (technologiesUsed.includes("React") && technologiesUsed.includes("psql") && technologiesUsed.includes("Express")) {
            console.log("PERN Stack");
            stackUsed = 'PERN Stack';
            domain = "Web Application";
        }
        if (technologiesUsed.includes("react-native") || technologiesUsed.includes("flutter")) {
            domain = "Mobile Application";
        }
        if (technologiesUsed.includes("ember") || technologiesUsed.includes("flask") || technologiesUsed.includes("django") || technologiesUsed.includes("rails") || technologiesUsed.includes("laravel") || technologiesUsed.includes("spring")) {
            domain = "Web Application";
        }
        if (domain) {
            terminal_1.runGitCommandInTerminal(`echo "Repository Domain:" >> report.txt && echo ${domain} >> report.txt`, folderUri.path);
        }
        if (stackUsed) {
            terminal_1.runGitCommandInTerminal(`echo "Stack Used:" >> report.txt && echo ${stackUsed} >> report.txt`, folderUri.path);
        }
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
        terminal_1.runGitCommandInTerminal('git branch -a >> report.txt', folderUri.path);
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
                    //FOR JAVASCRIPT BASED REPOS
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
                    if (packageText.includes("psql")) {
                        console.log("psql");
                        technologiesUsed.push("psql");
                    }
                    if (packageText.includes("express")) {
                        console.log("Express");
                        technologiesUsed.push("Express");
                    }
                    if (packageText.includes("react-native")) {
                        console.log("react-native");
                        technologiesUsed.push("react-native");
                    }
                    if (packageText.includes("ember")) {
                        console.log("ember");
                        technologiesUsed.push("ember");
                    }
                }
                else if (name == "requirements.txt") {
                    let packagePath = folderUri.with({ path: path_1.posix.join(folderUri.path, name) });
                    const packageBuffer = yield vscode.workspace.fs.readFile(packagePath);
                    const packageText = packageBuffer.toString();
                    if (packageText.includes("django")) {
                        console.log("Django");
                        technologiesUsed.push("django");
                    }
                    if (packageText.includes("flask")) {
                        console.log("Flask");
                        technologiesUsed.push("flask");
                    }
                }
                else if (name == "Gemfile") {
                    // For Ruby Apps
                    let packagePath = folderUri.with({ path: path_1.posix.join(folderUri.path, name) });
                    const packageBuffer = yield vscode.workspace.fs.readFile(packagePath);
                    const packageText = packageBuffer.toString();
                    if (packageText.includes("rails")) {
                        console.log("Ruby on rails");
                        technologiesUsed.push("rails");
                    }
                }
                else if (name == "composer.json") {
                    //FOR PHP Apps
                    let packagePath = folderUri.with({ path: path_1.posix.join(folderUri.path, name) });
                    const packageBuffer = yield vscode.workspace.fs.readFile(packagePath);
                    const packageText = packageBuffer.toString();
                    if (packageText.includes("laravel")) {
                        console.log("Laravel");
                        technologiesUsed.push("laravel");
                    }
                }
                else if (name == "pom.xml") {
                    //FOR Java Apps
                    let packagePath = folderUri.with({ path: path_1.posix.join(folderUri.path, name) });
                    const packageBuffer = yield vscode.workspace.fs.readFile(packagePath);
                    const packageText = packageBuffer.toString();
                    if (packageText.includes("spring")) {
                        console.log("Spring");
                        technologiesUsed.push("spring");
                    }
                }
                else if (name == "pubspec.yaml") {
                    //FOR Java Apps
                    let packagePath = folderUri.with({ path: path_1.posix.join(folderUri.path, name) });
                    const packageBuffer = yield vscode.workspace.fs.readFile(packagePath);
                    const packageText = packageBuffer.toString();
                    if (packageText.includes("flutter")) {
                        console.log("Flutter");
                        technologiesUsed.push("flutter");
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