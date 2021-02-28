cd food4all
printf "Creation Date : " > ../report.txt
curl -s https://api.github.com/repos/krish7777/food4all | jq '.created_at' >> ../report.txt
printf "\nLast commit details : \n" >> ../report.txt
git log -1  >> ../report.txt
printf "\nBranches List : \n " >> ../report.txt
git branch -a >> ../report.txt
printf "\nContributors List & no of commits \n " >> ../report.txt
git shortlog -s -n >> ../report.txt
printf "\nEach Contributor Commits and commit history \n" >> ../report.txt
git log --pretty=format:"%h - %an, %cr : %s" >> ../report.txt

echo "Commands git log --oneline , git log --stat, git shortlog git log --author=<name> --no-merges" >> ../report.txt
