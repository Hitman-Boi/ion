#!/bin/bash

# Load the docker image
echo "Loading docker image..."
docker load -i my-app-image.tar

# Start the application
echo "Starting application..."
docker-compose up -d
