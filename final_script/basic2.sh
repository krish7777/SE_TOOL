cd food4all
printf "\nLast commit details : \n" >> ../report.txt
git log -1  >> ../report.txt
printf "\nBranches List : \n " >> ../report.txt
git branch -a >> ../report.txt
printf "\nLanguages : \n " >> ../report.txt
curl   -H "Accept: application/vnd.github.v3+json"   https://api.github.com/repos/krish7777/food4all/languages  >> ../report.txt

users=$(git shortlog -sn --no-merges | awk '{printf "%s %s\n", $2, $3}')
IFS=$'\n'
echo -e "--------------------------------------------------------------------------------------------------------------------------------------"  >> ../report.txt
echo -e "|      User Name     |  Files Changed |   Lines Added  |  Lines Deleted | Total Lines (delta)|  Add./Del. ratio (1:n) | Commit Count |"  >> ../report.txt
echo -e "--------------------------------------------------------------------------------------------------------------------------------------"  >> ../report.txt
for userName in $users
do
     result=$(git log --author="$userName" --no-merges --shortstat | grep -E "fil(e|es) changed" | awk '{ inserted+=$4; deleted+=$6; delta+=$4-$6; ratio=deleted/inserted} END {printf "%16s|%16s|%20s|%24s", inserted, deleted, delta, ratio }' -)
     countCommits=$(git shortlog -sn --no-merges --author="$userName" | awk '{print $1}')
     filesChanged=$(git log --name-only --author="$userName" --no-merges --pretty=format: | sort | uniq -c | sort | wc -l | awk '{printf "%d", $1}')
     
     if [[ ${result} != '|||' ]]
     then
         printf "|%20s|%16d|%s|%14s|\n" $userName $filesChanged $result $countCommits >> ../report.txt
     fi
done
echo -e "--------------------------------------------------------------------------------------------------------------------------------------"  >> ../report.txt

printf "\nCommunity Profile : \n" >> ../report.txt
curl   -H "Accept: application/vnd.github.v3+json"   https://api.github.com/repos/krish7777/food4all/community/profile  >> ../report.txt

printf "\ncommit seggregation : \n" >> ../report.txt
printf "\nUI \n" >> ../report.txt
git log --pretty="%an" --grep="UI" --no-merges >> ../report.txt
printf "\nBug \n" >> ../report.txt
git log --pretty="%an" --grep="bug" --no-merges >> ../report.txt
printf "\nbackend \n" >> ../report.txt
git log --pretty="%an" --grep="backend" --no-merges >> ../report.txt
