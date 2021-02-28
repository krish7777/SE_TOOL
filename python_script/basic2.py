
import base64
from github import Github
from pprint import pprint

# Github username
username = "dinkar64"
# pygithub object
g = Github()

repo = g.get_repo("krish7777/food4all")

for contributors in repo.get_contributors():
    print(contributors)

def print_repo(repo):
    # repository full name
    print("Full name:", repo.full_name)
    # repository description
    print("Description:", repo.description)
    # the date of when the repo was created
    print("Date created:", repo.created_at)
    # the date of the last git push
    print("Date of last push:", repo.pushed_at)
    # number of forks
    print("Number of forks:", repo.forks)
    # number of stars
    print("Number of stars:", repo.stargazers_count)
    print("-"*50)
    # no of Issues 
    print("Open Issues :")
    open_issues = repo.get_issues(state='open')
    for issue in open_issues:
    	print(issue)
    
    print("Closed Issues :")	
    count = 0
    closed_issues = repo.get_issues(state='closed')
    for issue in closed_issues:
    	count +=1
    print(count)
    
    # No of pull requests 
    print("Open Pull Requests :")
    pulls = repo.get_pulls(state='open', sort='created', base='master')
    count = 0
    for pr in pulls:
    	count += 1
    print(count)
    
    print("closed Pull Requests :")
    pulls_closed = repo.get_pulls(state='closed', sort='created', base='master')
    count = 0
    for pr in pulls_closed:
    	count += 1
    print(count)
    
    try:
        # repo license
        print("License:", base64.b64decode(repo.get_license().content.encode()).decode())
    except:
        pass
        
        
# iterate over all public repositories
print_repo(repo)
