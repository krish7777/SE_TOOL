cd food4all
users=$(git shortlog -sn --no-merges -- $file | awk '{printf "%s %s\n", $2, $3}')
IFS=$'\n'
for userName in $users
do
echo -e "/* $userName */" >> ../report.txt

for week in Mon Tue Wed Thu Fri Sat Sun
do
counter=0
printf "\n" >> ../report.txt
while read rev 
do
    let counter++
done < <( git log --pretty='format:%h %cd ' --author=$userName --no-merges | grep $week |  awk '{print $1}' )
printf "\t $week - $counter" >> ../report.txt
done

done
