#!/bin/bash

# Variables
SERVICE_NAME="orca-ai"
LABEL="orca-ai"
IMAGE="ai_web"

# AWS Lightsail Command
aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label "$LABEL" \
    --image "$IMAGE"