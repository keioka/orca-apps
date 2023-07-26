#!/bin/bash

# Variables
# SERVICE_NAME="orca-ai"
# CONTAINERS_JSON="containers.json"
# PUBLIC_ENDPOINT_JSON="public-endpoint.json"

# AWS Lightsail Command
aws lightsail create-container-service-deployment --service-name="orca-ai" --containers="file://containers.json" --public-endpoint="file://public-endpoint.json"