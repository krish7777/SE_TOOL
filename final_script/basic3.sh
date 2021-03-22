cd food4all
echo -e "/*Note : File contributors are mentioned in each file at eof */"  >> ../report.txt
files=$(find $(pwd) -type f -name "*.js" | awk '{printf "%s\n", $1}') 
IFS=$'\n'
for file in $files
do
echo -e "/* File contributors */"  >> $file
echo -e "/* $file */" >> $file
users=$(git shortlog -sn --no-merges -- $file | awk '{printf "%s %s\n", $2, $3}')
IFS=$'\n'
echo -e "/* User name; Lines added; Lines deleted; Commit count */"  >> $file
for userName in $users
do
     time=$(git log --author="$userName" --no-merges --shortstat -- $file)
     result=$(git log --author="$userName" --no-merges --shortstat -- $file | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "%s;%s", inserted, deleted}' -)
     countCommits=$(git shortlog -sn --no-merges --author="$userName" -- $file | awk '{print $1}')
     if [[ ${result} != ';;;;' ]]
     then
        echo -e "/* $userName; $result; $countCommits; */"  >> $file
        echo -e "/* Commits made to File : */"  >> $file
        echo -e "/* $time */"  >> $file
     fi
done
done
