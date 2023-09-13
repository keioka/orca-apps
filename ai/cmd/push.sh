#!/bin/bash

# Variables
SERVICE_NAME="orca-ai"
LABEL="orca-ai-prod"
IMAGE="orca-ai-prod"

# AWS Lightsail Command
aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label "$LABEL" \
    --image "$IMAGE"