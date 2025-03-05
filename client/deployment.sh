#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Navigate to the directory from where the script is run
cd "$SCRIPT_DIR" || exit 1

# Fetch the latest changes without merging
git fetch origin main

# Compare the latest commit hash on the remote and local main branch
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "New changes detected. Pulling updates..."

    # Pull the latest changes
    git pull origin main

    # Build and restart containers
    docker compose up --build -d

    echo "Deployment completed successfully."
else
    echo "No new changes. Skipping deployment."
fi
