// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import { runGitCommandInTerminal } from './terminal';
import { posix } from 'path';
const { exec } = require('child_process');
import allTechnologies from "./technologies.json"
import fs from 'fs';
import path from "path"
import axios from 'axios'
const acorn = require("acorn-loose")

let technologiesUsed: string[] = [];
//let shellcode = fs.readFileSync('script.txt')
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "github-documenter" is now active!');
	//console.log(shellcode)

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('github-documenter.generateReport', async () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}
		vscode.window.showInformationMessage('Please Enter the Github Repository name eg. [username]/[repo_name]');
		let githubName = await vscode.window.showInputBox();
		let folderUri = vscode.workspace.workspaceFolders[0].uri;

		githubName && vscode.window.showInformationMessage('The detailed report will be generated in report.txt file. Please wait a few seconds :)');
		console.log("github name - ", githubName);

		let res = await axios.get(`https://api.github.com/repos/${githubName}`)
		let data = res.data;
		console.log(data);
		let fullName = data.full_name;
		let description = data.description;
		let created_at = data.created_at;
		let last_pushed_at = data.pushed_at;
		let no_forks = data.forks;
		let no_stars = data.stargazers_count;
		let watchers_count = data.watchers_count;
		let main_language = data.language;
		let open_issues = data.open_issues;
		let license = data.license?.name;
		let contributors = [];

		res = await axios.get(data.contributors_url)
		data = res.data;
		let contributorsString = ''
		data.map(function (contributor: any) {
			console.log(contributor.login)
			contributors.push(contributor.login);
			contributorsString += contributor.login + '\n';

		})

		let allLanguagesString = '';
		res = await axios.get(`https://api.github.com/repos/${githubName}/languages`)
		data = res.data;
		Object.keys(data).map(function (key, index) {
			allLanguagesString += key + ':' + data[key] + '\n';
		});
		res = await axios.get(`https://api.github.com/repos/${githubName}/pulls?state=open`)
		data = res.data;
		let open_pull = data && data.length;
		res = await axios.get(`https://api.github.com/repos/${githubName}/pulls?state=closed`)
		data = res.data;
		let closed_pull = data && data.length;


		let finalString = `Full Name: ${fullName}\n\nDescription: ${description}\n\nDate created: ${created_at}\n\nDate of last push: ${last_pushed_at}\n\nContributors:\n${contributorsString}\n\nNumber of forks: ${no_forks}\n\nNumber of stars: ${no_stars}\n\nNumber of watchers: ${watchers_count}\n\nMain Language: ${main_language}\n\nNo of open issues: ${open_issues}\n\nLicense: ${license ? license : "None"}\n\nNo of open pull requests: ${open_pull}\n\nNo. of closed pull requests: ${closed_pull}\n\nAll languages used:\n${allLanguagesString}\n\n`;
		console.log("final", finalString)
		runGitCommandInTerminal('rm report.txt', folderUri.path)
		runGitCommandInTerminal(
			`printf "${finalString}" >> report.txt`, folderUri.path
		)



		await checkFileNames(folderUri);
		console.log(technologiesUsed);
		let stackUsed = ''
		let domain = ''
		if (technologiesUsed.includes("React") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express")) {
			console.log("MERN Stack");
			stackUsed = 'MERN Stack';
			domain = "Web Application"
		}

		if (technologiesUsed.includes("Angular") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express")) {
			console.log("MEAN Stack");
			stackUsed = 'MEAN Stack';
			domain = "Web Application"
		}

		if (technologiesUsed.includes("Vue") && technologiesUsed.includes("MongoDB") && technologiesUsed.includes("Express")) {
			console.log("MEVN Stack");
			stackUsed = 'MEVN Stack';
			domain = "Web Application"
		}

		if (technologiesUsed.includes("React") && technologiesUsed.includes("psql") && technologiesUsed.includes("Express")) {
			console.log("PERN Stack");
			stackUsed = 'PERN Stack';
			domain = "Web Application"
		}

		if (technologiesUsed.includes("react-native") || technologiesUsed.includes("flutter")) {
			domain = "Mobile Application";
		}

		if (technologiesUsed.includes("ember") || technologiesUsed.includes("flask") || technologiesUsed.includes("django") || technologiesUsed.includes("rails") || technologiesUsed.includes("laravel") || technologiesUsed.includes("spring")) {
			domain = "Web Application";
		}

		if (domain) {
			runGitCommandInTerminal(`echo "Repository Domain:" >> report.txt && echo ${domain} >> report.txt`, folderUri.path)
		}

		if (stackUsed) {
			runGitCommandInTerminal(`echo "Stack Used:" >> report.txt && echo ${stackUsed} >> report.txt`, folderUri.path)
		}


		runGitCommandInTerminal(
			`printf "\\nLast commit details : \\n" >> report.txt && git log -1  >> report.txt
printf "\\nBranches List : \\n " >> report.txt && git branch -a >> report.txt
printf "\\nBranches Last Commit and Committer: \\n " >> report.txt
git for-each-ref --sort='-committerdate:iso8601' --format='%(committerdate:default)|%(refname:short)|%(committername)' refs/remotes/ | column -s '|' -t >> report.txt
IFS=$'\\n'
echo -e "--------------------------------------------------------------------------------------------------------------------------------------"  >> report.txt ;
echo -e "|      User Name     |  Files Changed |   Lines Added  |  Lines Deleted | Total Lines (delta)|  Add./Del. ratio (1:n) | Commit Count |"  >> report.txt ;
echo -e "--------------------------------------------------------------------------------------------------------------------------------------"  >> report.txt ;
users=$(git shortlog -sn --no-merges | awk '{printf "%s %s\\n", $2, $3}');
for userName in $users ; 
do
result=$(git log --author="$userName" --no-merges --shortstat | grep -E "fil(e|es) changed" | awk '{ inserted+=$4; deleted+=$6; delta+=$4-$6; ratio=deleted/inserted} END {printf "%16s|%16s|%20s|%24s", inserted, deleted, delta, ratio }' -)
countCommits=$(git shortlog -sn --no-merges --author="$userName" | awk '{print $1}')
filesChanged=$(git log --name-only --author="$userName" --no-merges --pretty=format: | sort | uniq -c | sort | wc -l | awk '{printf "%d", $1}')
printf "|%20s|%16d|%s|%14s|\\n" $userName $filesChanged $result $countCommits >> report.txt
done;
echo -e "--------------------------------------------------------------------------------------------------------------------------------------"  >> report.txt ;
printf "\n\nNo of commits on each Week Day : \\n" >> report.txt
printf "\n\n\tDay - No of commits\n" >> report.txt
for week in Mon Tue Wed Thu Fri Sat Sun
do
counter=0
printf "\\n" >> report.txt
while read rev 
do
	let counter++
done < <( git log --pretty='format:%h %cd ' --no-merges | grep $week |  awk '{print $1}' )
printf "\t$week - $counter" >> report.txt
done

printf "\\n\\nCommit seggregation : \\n" >> report.txt

for i in UI Bug Backend Frontend Test Deploy
do
printf "\\n$i \\n" >> report.txt
git log --pretty="%an" -i --grep="$i" --no-merges | sort -u >> report.txt
done
ui=$(git log --pretty="%an" -i --grep="UI" --no-merges | sort -u)
bug=$(git log --pretty="%an" -i --grep="Bug" --no-merges | sort -u)
backend=$(git log --pretty="%an" -i --grep="Backend" --no-merges | sort -u)
frontend=$(git log --pretty="%an" -i --grep="Frontend" --no-merges | sort -u)
test=$(git log --pretty="%an" -i --grep="Test" --no-merges | sort -u)
deploy=$(git log --pretty="%an" -i --grep="Deploy" --no-merges | sort -u)
			`
			, folderUri.path
		)


	});

	let disposable2 = vscode.commands.registerTextEditorCommand('github-documenter.generateDocs', async () => {
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}
		console.log("running")
		const editor = vscode.window.activeTextEditor;
		let folderUri = vscode.workspace.workspaceFolders[0].uri;

		if (editor) {
			console.log("has editor")
			let document = editor.document.uri.path;
			document = document.replace(':', '')
			vscode.window.showInformationMessage('The detailed information will be shown at the bottom of the file');
			runGitCommandInTerminal(
				`users=$(git shortlog -sn --no-merges -- ${document} | awk '{printf "%s %s\\n", $2, $3}')
IFS=$'\\n'
printf "\\n"
echo -e "/* User name; Lines added; Lines deleted; Commit count */"  >> ${document}
for userName in $users
do
time=$(git log --author="$userName" --no-merges --shortstat -- ${document})
result=$(git log --author="$userName" --no-merges --shortstat -- ${document} | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "%s;%s", inserted, deleted}' -)
countCommits=$(git shortlog -sn --no-merges --author="$userName" -- ${document} | awk '{print $1}')
if [[ \${result} != ';;;;' ]]
then
echo -e "/* $userName; $result; $countCommits; */"  >> ${document}
echo -e "/* Commits made to file : */"  >> ${document}
echo -e "/* $time */"  >> ${document}
fi
done`, folderUri.path)
		}




	})


	let disposable3 = vscode.commands.registerCommand('github-documenter.findFileReference', function () {
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const walkSync = (dir, filelist = []) => {
			fs.readdirSync(dir).forEach(file => {
				function wantToWalk(file) {
					return !['node_modules', 'bower_components', '.git'].includes(file)
				}
				filelist = (fs.statSync(path.join(dir, file)).isDirectory() && wantToWalk(file))
					? walkSync(path.join(dir, file), filelist)
					: filelist.concat(path.join(dir, file));
			});
			return filelist;
		}



		function getAbsPath(importPath, startingPath) {
			if (importPath.length) {
				let path = importPath.split('/');
				let retPath = startingPath.split('\\');
				retPath.pop();
				for (let part of path) {
					if (part.trim()) {
						if (part === '.') {
							// do nothing
						} else if (part === '..') {
							retPath.pop();
						} else {
							retPath.push(part);
						}
					}
				}
				return retPath.join('\\');
			} else {
				return importPath;
			}
		}

		function appendDotJs(filename) {
			return filename.toLowerCase().endsWith('.js') ? filename : filename + '.js';
		}

		function appendIndexJs(filename) {
			return filename.toLowerCase().endsWith('.js') ? filename : filename + '\\index.js'
		}



		console.log("running")
		const editor = vscode.window.activeTextEditor;
		let workspaceFolders = vscode.workspace.workspaceFolders;
		if (editor) {
			let currentFile = editor.document.fileName;
			if (currentFile.toLowerCase().endsWith('.js')) {
				let workspaceFolderPaths = workspaceFolders.map(folder => folder.uri.fsPath);
				let jsFiles = [];
				for (const path of workspaceFolderPaths) {
					jsFiles = jsFiles.concat(walkSync(path).filter(f => f.toLowerCase().endsWith('.js')))
				} console.log(jsFiles);

				try {
					let filesThatImportCurrentFile = [];
					for (const fileName of jsFiles) {
						let parsed = acorn.parse(fs.readFileSync(fileName, 'utf8'));
						for (const item of parsed.body) {
							if (item.type === "ImportDeclaration") {
								let importPath = item.source.value;
								if (importPath.startsWith('.')) {
									let absPath = getAbsPath(importPath, fileName);
									if (appendDotJs(absPath).toLowerCase() === currentFile.toLowerCase() || appendIndexJs(absPath).toLowerCase() === currentFile.toLowerCase()) {
										filesThatImportCurrentFile.push(fileName);
									}
								}
							}
						}
					}
					console.log(filesThatImportCurrentFile);

					if (filesThatImportCurrentFile.length) {
						// display file list
						vscode.window.showQuickPick(filesThatImportCurrentFile.map((fn, index) => ({
							id: index,
							label: fn.split('\\').pop(),
							description: fn
						}))).then(item => {
							vscode.workspace.openTextDocument(item?.description).then(document => {
								vscode.window.showTextDocument(document, { preview: false });
							});
						});
					} else {
						// show 'no files found'
						vscode.window.showQuickPick([{
							label: 'No files found.'
						}]).then(item => {
							// do nothing
						});
					}

				}
				catch (err) {
					console.log("error", err)
				}





			}


		}

	})



	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3)
}



export async function checkFileNames(folderUri: any) {

	for (const [name, type] of await vscode.workspace.fs.readDirectory(folderUri)) {
		if (type == vscode.FileType.Directory && name != "node_modules") {
			await checkFileNames(folderUri.with({ path: posix.join(folderUri.path, name) }))
		}
		else {
			//console.log(name + " - " + type);
			if (name == "package.json") {
				//FOR JAVASCRIPT BASED REPOS
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
				if (packageText.includes("psql")) {
					console.log("psql")
					technologiesUsed.push("psql");
				}
				if (packageText.includes("express")) {
					console.log("Express")
					technologiesUsed.push("Express");
				}
				if (packageText.includes("react-native")) {
					console.log("react-native")
					technologiesUsed.push("react-native");
				}
				if (packageText.includes("ember")) {
					console.log("ember")
					technologiesUsed.push("ember");
				}
			}
			else if (name == "requirements.txt") {
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				if (packageText.includes("django")) {
					console.log("Django")
					technologiesUsed.push("django");
				}
				if (packageText.includes("flask")) {
					console.log("Flask")
					technologiesUsed.push("flask");
				}
			}
			else if (name == "Gemfile") {
				// For Ruby Apps
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				if (packageText.includes("rails")) {
					console.log("Ruby on rails")
					technologiesUsed.push("rails");
				}
			}
			else if (name == "composer.json") {
				//FOR PHP Apps
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				if (packageText.includes("laravel")) {
					console.log("Laravel")
					technologiesUsed.push("laravel");
				}
			}
			else if (name == "pom.xml") {
				//FOR Java Apps
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				if (packageText.includes("spring")) {
					console.log("Spring")
					technologiesUsed.push("spring");
				}
			}
			else if (name == "pubspec.yaml") {
				//FOR Java Apps
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				if (packageText.includes("flutter")) {
					console.log("Flutter")
					technologiesUsed.push("flutter");
				}
			}
		}

	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
