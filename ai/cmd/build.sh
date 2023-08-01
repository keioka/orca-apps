#!/bin/bash

docker build -t orca-ai . $(for i in `cat .env.prod`; do out+="--build-arg $i " ; done; echo $out;out="") 
