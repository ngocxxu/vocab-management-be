#!/bin/bash

# Ensure the Docker user has access to the deployed files
usermod -a -G docker ec2-user