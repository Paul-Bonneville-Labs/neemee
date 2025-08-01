#!/bin/bash

# Stop and remove any running container named 'neemee-backend'
if [ $(docker ps -q -f name=neemee-backend) ]; then
  echo "Stopping running 'neemee-backend' container..."
  docker stop neemee-backend
  docker rm neemee-backend
fi

# Build the Docker image
echo "Building Docker image 'neemee-backend'..."
docker build -t neemee-backend .

# Run the Docker container
echo "Running Docker container 'neemee-backend' on port 8080..."
docker run -d --name neemee-backend -p 8080:8080 neemee-backend

# Wait for the app to start
echo "Waiting for the app to start..."
sleep 3

# Test the endpoint
echo "Testing the local endpoint: http://localhost:8080/"
curl --fail http://localhost:8080/ || { echo "App did not respond as expected."; exit 1; }
echo -e "\nApp is running and responded successfully." 