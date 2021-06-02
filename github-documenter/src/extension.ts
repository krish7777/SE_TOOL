import * as vscode from 'vscode';
import { runGitCommandInTerminal } from './terminal';
import { posix } from 'path';
import { AutoDocstring } from "./docstring";
import allTechnologies from "./technologies.json"
import fs from 'fs';
import path from "path"
import axios from 'axios'
const acorn = require("acorn-loose")

let technologiesUsed: string[] = [];

// This method is called when thw extension is activated
export function activate(context: vscode.ExtensionContext) {

	// External Documentation Command
	let externalDocumentation = vscode.commands.registerCommand('github-documenter.generateExternalDocs', async () => {

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		let folderUri = vscode.workspace.workspaceFolders[0].uri;
		let tempFile = folderUri.path + '/hello.txt'
		tempFile = tempFile.replace(':', '')

		//A pop up input box to enter the repository full name
		vscode.window.showInformationMessage('Please Enter the Github Repository name eg. [username]/[repo_name]');
		let githubName = await vscode.window.showInputBox();

		githubName && vscode.window.showInformationMessage('The detailed report will be generated in report.txt file. Please wait a few seconds :)');

		//Extracting all the required information from Github API
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
		res = await axios.get(`https://api.github.com/repos/${githubName}/community/profile`)
		data = res.data;
		let health_percentage = data && data.health_percentage;
		let readme_file = data && data.files?.readme?.html_url;
		if (!readme_file)
			readme_file = 'None'


		let finalString = `Full Name of repo: ${fullName}\n\nDescription: ${description}\n\Creation date of repo: ${created_at}\n\nDate of last push to repo: ${last_pushed_at}\n\nContributors to the repo:\n${contributorsString}\n\nNumber of forks: ${no_forks}\n\nNumber of stars: ${no_stars}\n\nNumber of watchers: ${watchers_count}\n\nMain Language used: ${main_language}\n\nNo of open issues: ${open_issues}\n\nLicense: ${license ? license : "None"}\n\nNo of open pull requests: ${open_pull}\n\nNo. of closed pull requests: ${closed_pull}\n\nAll languages used:\n${allLanguagesString}\nHealth Percentage: ${health_percentage}\n\nReadme File: ${readme_file}\n`;
		runGitCommandInTerminal('rm report.txt', folderUri.path)
		runGitCommandInTerminal(
			`printf "${finalString}" >> report.txt`, folderUri.path
		)


		//Analysising the technologies used in the repo and the stack and domain information
		await checkFilesForTechnologies(folderUri);
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
			runGitCommandInTerminal(`echo -e "The domain of the repository is: ${domain} " >> report.txt`, folderUri.path)
		}

		if (stackUsed) {
			runGitCommandInTerminal(`echo -e "The Web Stack used in the repository is : ${stackUsed}" >> report.txt`, folderUri.path)
		}

		//Extracting all the git-related information through terminal

		runGitCommandInTerminal(
			`printf "\\nLast commit details : \\n" >> report.txt && git log -1  >> report.txt
printf "\\nBranches List : \\n" >> report.txt && git branch -a >> report.txt
printf "\\nBranches Last Commit and Committer: \\n" >> report.txt
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
	
printf "\n\nCommits on each week day of all contributors : \\n" >> report.txt

echo -e "\\n----------------------------------------------------------------"  >> report.txt ;
echo -e "|      User Name     | Mon | Tue | Wed | Thu | Fri | Sat | Sun |"  >> report.txt ;
echo -e "----------------------------------------------------------------"  >> report.txt ;

for userName in $users
do
printf "|%20s|" $userName >> report.txt
for week in Mon Tue Wed Thu Fri Sat Sun
do
counter=0
while read rev 
do
    let counter++
done < <( git log --pretty='format:%h %cd ' --author=$userName --no-merges | grep $week |  awk '{print $1}' )
printf "%5d|" $counter >> report.txt
done
echo -e "" >> report.txt ;
done
echo -e "----------------------------------------------------------------"  >> report.txt ;
	
printf "\n Number of commits on each Week Day : \n" >> report.txt
	
echo -e "\\n--------------------------------------------------"  >> report.txt ;
echo -e "| Day | Commits | Files | Insertions | Deletions |"  >> report.txt ;
echo -e "--------------------------------------------------"  >> report.txt ;
for week in Mon Tue Wed Thu Fri Sat Sun
do
counter=0
file=0
insert=0
delete=0
while read rev 
do
	result=$(git show "$rev" --stat | grep -E "fil(e|es) changed" | awk '{files+=$1; inserted+=$4; deleted+=$6;} END {printf "%s", files}' -)
	echo -e "$result" 
while IFS= read -r line
do
	file=$(expr $file + $line)
done < "${tempFile}"
result=$(git show "$rev" --stat | grep -E "fil(e|es) changed" | awk '{files+=$1; inserted+=$4; deleted+=$6;} END {printf "%s", inserted}' -)
	echo -e "$result" > hello.txt
while IFS= read -r line
do
	insert=$(expr $insert + $line)
done < "${tempFile}"
result=$(git show "$rev" --stat | grep -E "fil(e|es) changed" | awk '{files+=$1; inserted+=$4; deleted+=$6;} END {printf "%s", deleted}' -)
	echo -e "$result" > hello.txt
while IFS= read -r line
do
	delete=$(expr $delete + $line)
done < "${tempFile}"
	let counter++
done < <( git log --pretty='format:%h %cd ' --no-merges | grep $week |  awk '{print $1}' )
printf "|%5s|%9s|%7s|%12s|%11s|" $week $counter $file $insert $delete >> report.txt
printf "\n" >> report.txt
done
echo -e "--------------------------------------------------"  >> report.txt ;

		
printf "\\n\\nAfter analysing the repo the following roles have been assigned to the contributors : \\n" >> report.txt

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


	/*
	Generate Internal Documentation
	*/

	let internalDocumentation = vscode.commands.registerTextEditorCommand('github-documenter.generateInternalDocs', async () => {
		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}


		const walkSync = (dir: string, filelist = []) => {
			fs.readdirSync(dir).forEach(file => {
				function wantToWalk(file: string) {
					return !['node_modules', '.vscode', '.git'].includes(file)
				}
				filelist = (fs.statSync(path.join(dir, file)).isDirectory() && wantToWalk(file))
					? walkSync(path.join(dir, file), filelist)
					: filelist.concat(path.join(dir, file));
			});
			return filelist;
		}


		//Extracting the absolute path from the relative import paths
		function getAbsPath(importPath: string, startingPath: string) {
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

		function appendDotJs(filename: string) {
			return filename.toLowerCase().endsWith('.js') ? filename : filename + '.js';
		}

		function appendIndexJs(filename: string) {
			return filename.toLowerCase().endsWith('.js') ? filename : filename + '\\index.js'
		}

		//Function to find which other files import the given file
		function findFileReference(currentFile: string, workspaceFolders: any, folderUri: any) {
			if (currentFile.toLowerCase().endsWith('.js')) {
				let workspaceFolderPaths = workspaceFolders.map((folder: any) => folder.uri.fsPath);
				let jsFiles: any[] = [];
				for (const path of workspaceFolderPaths) {
					jsFiles = jsFiles.concat(walkSync(path).filter((f: string) => f.toLowerCase().endsWith('.js')))
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
						// display file 
						/*
						vscode.window.showQuickPick(filesThatImportCurrentFile.map((fn, index) => ({
							id: index,
							label: fn.split('\\').pop(),
							description: fn
						}))).then(item => {
							vscode.workspace.openTextDocument(item?.description).then(document => {
								vscode.window.showTextDocument(document, { preview: false });
							});
						});
						*/
						let document = editor?.document.uri.path;
						document = document?.replace(':', '')
						runGitCommandInTerminal(`echo -e "\\n/*---------------------FILES IMPORTING THIS FILE---------------------*/\\n" >> ${document}`, folderUri.path)
						filesThatImportCurrentFile.map(function (file) {
							file = file.replaceAll('\\', '\/')
							runGitCommandInTerminal(`echo -e "/* ${file} */" >> ${document} && echo -e "\\n/*-------------------------------------------------------------------*/" >> ${document}
							`, folderUri.path)
						})
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

		const editor = vscode.window.activeTextEditor;
		let folderUri = vscode.workspace.workspaceFolders[0].uri;

		if (editor) {
			let workspaceFolders = vscode.workspace.workspaceFolders;
			let currentFile = editor.document.fileName;
			findFileReference(currentFile, workspaceFolders, currentFile);
			let document = editor.document.uri.path;
			document = document.replace(':', '')
			vscode.window.showInformationMessage('The detailed information will be shown at the bottom of the file');
			runGitCommandInTerminal(
				`users=$(git shortlog -sn --no-merges -- ${document} | awk '{printf "%s %s\\n", $2, $3}')
IFS=$'\\n'
echo -e "" >> ${document}
echo -e "/*------------------------CONTRIBUTION SUMMARY-----------------------*/" >> ${document}
echo -e "/*-------------------------------------------------------------------*/" >> ${document} ;
echo -e "/*|      User Name     | Lines Added | Lines Deleted | Commit Count |*/" >> ${document} ;
echo -e "/*-------------------------------------------------------------------*/" >> ${document} ;
allCommits=$(git log --no-merges --shortstat -- ${document})
for userName in $users
do
result=$(git log --author="$userName" --no-merges --shortstat -- ${document} | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "%13s|%15s", inserted, deleted}' -)
countCommits=$(git shortlog -sn --no-merges --author="$userName" -- ${document} | awk '{print $1}')
if [[ \${result} != '|' ]]
then
printf "/*|%20s|%s|%14s|*/\\n" $userName $result $countCommits >> ${document}
fi
done
echo -e "/*-------------------------------------------------------------------*/" >> ${document} ;
echo -e "\\n" >> ${document}
echo -e "/*---------------DETAILED COMMIT HISTORY OF THE FILE-----------------*/"  >> ${document}
echo -e "\\n" >> ${document}
echo -e "/*\\n$allCommits \\n*/"  >> ${document}
`, folderUri.path)
		}
	})

	/*
		Generating Comments for functions
	*/

	let commentGenerator = vscode.commands.registerCommand('github-documenter.generateDocstring', function () {
		const editor = vscode.window.activeTextEditor;
		if (editor) {

			const autoDocstring = new AutoDocstring(editor);

			try {
				return autoDocstring.generateDocstring();
			} catch (err) {
			}
		}

	})


	context.subscriptions.push(externalDocumentation);
	context.subscriptions.push(internalDocumentation);
	context.subscriptions.push(commentGenerator);
}


export async function checkFilesForTechnologies(folderUri: any) {

	for (const [name, type] of await vscode.workspace.fs.readDirectory(folderUri)) {
		if (type == vscode.FileType.Directory && name != "node_modules") {
			await checkFilesForTechnologies(folderUri.with({ path: posix.join(folderUri.path, name) }))
		}
		else {
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
				//For Python Apps
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
				//For PHP Apps
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				if (packageText.includes("laravel")) {
					console.log("Laravel")
					technologiesUsed.push("laravel");
				}
			}
			else if (name == "pom.xml") {
				//For Java Apps
				let packagePath = folderUri.with({ path: posix.join(folderUri.path, name) })
				const packageBuffer = await vscode.workspace.fs.readFile(packagePath)
				const packageText = packageBuffer.toString();
				if (packageText.includes("spring")) {
					console.log("Spring")
					technologiesUsed.push("spring");
				}
			}
			else if (name == "pubspec.yaml") {
				//For Dart Apps
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

// this method is called when the extension is deactivated
export function deactivate() { }
