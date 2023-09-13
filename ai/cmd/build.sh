#!/bin/bash
docker build . --tag=orca-ai-prod $(for i in `cat .env.prod`; do out+="--build-arg $i " ; done; echo $out;out="") 
# docker build . --tag=orca-ai-prod "--build-arg $i " ; done; echo $out;out="") 
