#!/bin/bash

# Set environment variables
export AWS_REGION=us-west-2
export TALK_URL=talk.aloware.com
export AWS_PROFILE=talk2-deployer

# Build and upload
git checkout master && git pull && yarn install && quasar build && ENV=prod yarn upload-s3
