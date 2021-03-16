
import base64
from github import Github
from pprint import pprint

# Github username
username = "dinkar64"
# pygithub object
g = Github()

repo = g.get_repo("krish7777/food4all")

def print_repo(repo):
    # repository full name
    print("\n Full name:", repo.full_name)
    # repository contributors 
    print("\n Contributors : ")
    for contributors in repo.get_contributors():
    	print(contributors)
    # repository description
    print("\n Description:", repo.description)
    # the date of when the repo was created
    print("\n Date created:", repo.created_at)
    # the date of the last git push
    print("\n Date of last push:", repo.pushed_at)
    # number of forks
    print("\n Number of forks:", repo.forks)
    # number of stars
    print("\n Number of stars:", repo.stargazers_count)
    print("-"*50)
    
    # No of pull requests 
    print("\n Open Pull Requests :")
    pulls = repo.get_pulls(state='open', sort='created')
    countop = 0
    for pr in pulls:
    	countop += 1
    print(countop)
    
    print("\n closed Pull Requests :")
    pulls_closed = repo.get_pulls(state='closed', sort='created')
    countcp = 0
    for pr in pulls_closed:
    	countcp += 1
    print(countcp)

    # no of Issues 
    print("\n Open Issues :")
    count = 0
    open_issues = repo.get_issues(state='open')
    for issue in open_issues:
    	count +=1
    print(count-countop)
    
    print("\n Closed Issues :")	
    count = 0
    closed_issues = repo.get_issues(state='closed')
    for issue in closed_issues:
    	count +=1
    print(count-countcp)
    
    try:
        # repo license
        print("License:", base64.b64decode(repo.get_license().content.encode()).decode())
    except:
        pass
        
        
# iterate over all public repositories
print_repo(repo)
