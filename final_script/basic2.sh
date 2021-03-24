cd food4all
printf "\nLast commit details : \n" >> ../report.txt
git log -1  >> ../report.txt
printf "\nBranches List : \n " >> ../report.txt
git branch -a >> ../report.txt
printf "\nBranches Last Commit and Committer: \n " >> ../report.txt
git for-each-ref --sort='-committerdate:iso8601' --format='%(committerdate:default)|%(refname:short)|%(committername)' refs/remotes/ | column -s '|' -t >> ../report.txt
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

printf "\n No of commits on each Week Day : \n" >> ../report.txt

printf "\n\t Day - No of commits \n" >> ../report.txt

for week in Mon Tue Wed Thu Fri Sat Sun
do
counter=0
printf "\n" >> ../report.txt
while read rev 
do
    let counter++
done < <( git log --pretty='format:%h %cd ' --no-merges | grep $week |  awk '{print $1}' )
printf "\t $week - $counter" >> ../report.txt
done

printf "\n\nCommunity Profile of the repository: \n" >> ../report.txt
curl   -H "Accept: application/vnd.github.v3+json"   https://api.github.com/repos/krish7777/food4all/community/profile  >> ../report.txt


printf "\n\n commit seggregation : \n" >> ../report.txt

for i in UI Bug Backend Frontend Test Deploy
do
printf "\n $i \n" >> ../report.txt
git log --pretty="%an" -i --grep="$i" --no-merges | sort -u >> ../report.txt
done

