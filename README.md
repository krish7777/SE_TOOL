# Github Documenter

This tool is developed under Software Engineering Lab Project. The main goal behind this tool is proper documentation of Github repositories and generate internal documentation for the repository files. The tool is developed as a VS Code Extension. 

Our tool can be used to achieve the following tasks :

- Generate a report for the locally cloned Github repo opened in VS Code and the report will be saved in a file called report.txt. 
- Generate an internal documentation for a selected file in the repository.
- Generate function comments for each function in a file(python files only)

## Report
The report contains detailed description and analytics, language, information regarding domain and stack used in the repository which can be easily read and understood by the reader.

A sample report file and an internal documentation file for the repository [krish7777/food4all](https://github.com/krish7777/food4all) is given in the samples folder

## Internal Documentation
Internal documentation is an important part of development. Through our tool, one can generate information about the development process of the file, contribution details, detailed commit history, and references to the file(only js files for now).

## Function comments

The user can select a particular function in the file and use our tool to generate a comprehensive summary of it which will be displayed as comments on top of it once it is generated.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/).

```bash
cd python-model-api
py -3 -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
gdown "https://drive.google.com/uc?id=1YrkwfM-0VBCJaa9NYaXUQPODdGPsmQY4" -O server/pytorch_model.bin
python app.py 
```
Make sure npm is installed
```bash
cd github-documenter
npm install
```

## Usage

- Make sure the python flask API is running
- Go to the github-documenter and run it
- Open any cloned github repo in VS Code
- Go to Command Pallette
- Select "Github Documenter: Generate Report for repo" command to generate the report
- Select "Github Documenter: Generate internal docs for file" command to generate internal docs for any file
- Select "Github Documenter: Generate docstring for the function" command after selecting the required function to generate the comments for the selected function

## File structure

- github-documenter : Files related to the VS Code extension
- python-model-api  : Files related to the CodeBert model and Flask API
- samples : Sample report and internal docs file
- final_script : Some of the scripts used in the final extension(for easy reference)
