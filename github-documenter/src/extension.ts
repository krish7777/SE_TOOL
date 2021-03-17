// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import { runGitCommandInTerminal } from './terminal';
import { posix } from 'path';
const { exec } = require('child_process');
import allTechnologies from "./technologies.json"


let technologiesUsed: string[] = [];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "github-documenter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('github-documenter.generateReport', async () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}
		vscode.window.showInformationMessage('Please Enter the Github Repository name');
		let ud = await vscode.window.showInputBox();
		let folderUri = vscode.workspace.workspaceFolders[0].uri;

		ud && vscode.window.showInformationMessage(folderUri.path);


		await checkFileNames(folderUri);
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

		runGitCommandInTerminal('git branch -a >> yoo3.txt', folderUri.path);

	});

	context.subscriptions.push(disposable);
}



export async function checkFileNames(folderUri: any) {

	for (const [name, type] of await vscode.workspace.fs.readDirectory(folderUri)) {
		if (type == vscode.FileType.Directory && name != "node_modules") {
			await checkFileNames(folderUri.with({ path: posix.join(folderUri.path, name) }))
		}
		else {
			//console.log(name + " - " + type);
			if (name == "package.json") {
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				// console.log(allTechnologies)
				// allTechnologies.forEach(tech => {
				// 	if (packageText.includes(tech)) {
				// 		console.log(tech)
				// 		technologiesUsed.push(tech);
				// 	}
				// });
				if (packageText.includes("react")) {
					console.log("React")
					technologiesUsed.push("React");
				}
				if (packageText.includes("antd")) {
					console.log("Antd")
					technologiesUsed.push("Antd");
				}
				if (packageText.includes("angular")) {
					console.log("Angular")
					technologiesUsed.push("Angular");
				}
				if (packageText.includes("vue")) {
					console.log("Vue")
					technologiesUsed.push("Vue");
				}
				if (packageText.includes("mongo")) {
					console.log("MongoDB")
					technologiesUsed.push("MongoDB");
				}
				if (packageText.includes("sql")) {
					console.log("SQL")
					technologiesUsed.push("SQL");
				}
				if (packageText.includes("express")) {
					console.log("Express")
					technologiesUsed.push("Express");
				}



			}
		}

	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
