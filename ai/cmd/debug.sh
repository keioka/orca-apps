echo "> Build Args"
echo docker build . --tag=orca-ai-prod $(for i in `cat .env.prod`; do out+="--build-arg $i " ; done; echo $out;out="") 

