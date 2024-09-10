#!/bin/bash

# Get the latest Docker image from ECR
docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG

# Remove the existing container
docker rm vocab-management-container || true

# Run the new Docker container
docker run -d --name vocab-management-container -p 4030:4030 --env-file $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
