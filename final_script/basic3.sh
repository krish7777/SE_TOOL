cd food4all
echo "	"  >> ../report.txt
echo "File changes"  >> ../report.txt
files=$(find $(pwd) -type f | awk '{printf "%s\n", $1}') 
IFS=$'\n'
for file in $files
do
echo -e "$file" >> ../report.txt
users=$(git shortlog -sn --no-merges -- $file | awk '{printf "%s %s\n", $2, $3}')
IFS=$'\n'
echo -e "User name; Files changed; Lines added; Lines deleted; Commit count"  >> ../report.txt
for userName in $users
do
     result=$(git log --author="$userName" --no-merges --shortstat -- $file | grep -E "fil(e|es) changed" | awk '{files+=$1; inserted+=$4; deleted+=$6} END {printf "%s;%s;%s", files, inserted, deleted}' -)
     countCommits=$(git shortlog -sn --no-merges --author="$userName" -- $file | awk '{print $1}')
     if [[ ${result} != ';;;;' ]]
     then
        echo -e "$userName;$result;$countCommits"  >> ../report.txt
     fi
done
done
