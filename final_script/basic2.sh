printf "\n\n\n Last commit details : \n" >> ../report.txt
git log -1  >> ../report.txt
printf "\nBranches List : \n " >> ../report.txt
git branch -a >> ../report.txt
printf "\nBranches Last Commit and Committer: \n " >> ../report.txt
git for-each-ref --sort='-committerdate:iso8601' --format='%(committerdate:default)|%(refname:short)|%(committername)' refs/remotes/ | column -s '|' -t >> ../report.txt

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

printf "\n Number of Merge Commits for each Contributors \n" >> ../report.txt
git shortlog -s -n --merges  >> ../report.txt

printf "\n Number of commits on each Week Day : \n" >> ../report.txt

printf "\n\t\t Mon \t Tue \t Wed \t Thu \t Fri \t Sat \t Sun \n" >> ../report.txt
printf "\n\t All : \t" >> ../report.txt
for week in Mon Tue Wed Thu Fri Sat Sun
do
counter=0
while read rev 
do
    let counter++
done < <( git log --pretty='format:%h %cd ' --no-merges | grep $week |  awk '{print $1}' )
printf "\t$counter" >> ../report.txt
done
printf "\n" >> ../report.txt
users=$(git shortlog -sn --no-merges -- $file | awk '{printf "%s %s\n", $2, $3}')
IFS=$'\n'
for userName in $users
do
printf "\n$userName" >> ../report.txt
for week in Mon Tue Wed Thu Fri Sat Sun
do
counter=0
while read rev 
do
    let counter++
done < <( git log --pretty='format:%h %cd ' --author=$userName --no-merges | grep $week |  awk '{print $1}' )
printf "\t$counter" >> ../report.txt
done

done

printf "\n\n Contributors Commits Seggregation : \n" >> ../report.txt


for i in UI Bug Backend Frontend Test Deploy
do
printf "\n $i \n" >> ../report.txt
git log --pretty="%an" -i --grep="$i" --no-merges | sort -u >> ../report.txt
done