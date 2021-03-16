printf "\nFramework : \n" >> ../report.txt
cd food4all
for i in Ruby Django Angular ASP.NET Meteor Laravel Spring Play CodeIgniter React
do
if [[ $(git log --pretty="%an" -S"$i" --no-merges) ]]; then
    echo "Framework $i"  >> ../report.txt
fi
done
