# Github Documenter

This tool is developed under Software Engineering Lab Project. The main goal behind this tool is proper documentation of Github repositories and generate internal documentation for the repository files. The tool is developed as a VS Code Extension. 

Our tool can be used to achieve the following tasks :

- Generate a report for the locally cloned Github repo opened in VS Code and the report will be saved in a file called report.txt. 
- Generate an internal documentation for a selected file in the repository.
- Generate function comments for each function in a file(python files only)

## Report
The report contains detailed description and analytics, language, information regarding domain and stack used in the repository which can be easily read and understood by the reader.

A sample report file for the repository krish7777/food4all

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
python app.py 
```


## Usage


## File structure
