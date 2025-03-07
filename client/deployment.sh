#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Navigate to the directory from where the script is run
cd "$SCRIPT_DIR" || exit 1

# Fetch the latest changes without merging
git fetch origin main

# Check for the -f argument to force rebuild
if [ "$1" == "-f" ]; then
    echo "Force rebuild initiated. Skipping commit hash comparison."

    # Get the latest commit SHA and message
    COMMIT_SHA=$(git rev-parse --short HEAD)  # Use short SHA for brevity
    COMMIT_MESSAGE=$(git log -1 --pretty=%B | tr -d '\n')  # Remove newlines for Docker

    # Export commit info as environment variables
    export COMMIT_SHA
    export COMMIT_MESSAGE

    # Build and restart containers with commit info
    docker compose build --build-arg COMMIT_SHA="$COMMIT_SHA" --build-arg COMMIT_MESSAGE="$COMMIT_MESSAGE"
    docker compose up -d

    echo "Force rebuild completed successfully."
    echo "Commit SHA: $COMMIT_SHA"
    echo "Commit Message: $COMMIT_MESSAGE"
else
    # Compare the latest commit hash on the remote and local main branch
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main)

    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "New changes detected. Pulling updates..."

        # Pull the latest changes
        git pull origin main

        # Get the latest commit SHA and message
        COMMIT_SHA=$(git rev-parse --short HEAD)  # Use short SHA for brevity
        COMMIT_MESSAGE=$(git log -1 --pretty=%B | tr -d '\n')  # Remove newlines for Docker

        # Export commit info as environment variables
        export COMMIT_SHA
        export COMMIT_MESSAGE

        # Build and restart containers with commit info
        docker compose build --build-arg COMMIT_SHA="$COMMIT_SHA" --build-arg COMMIT_MESSAGE="$COMMIT_MESSAGE"
        docker compose up -d

        echo "Deployment completed successfully."
        echo "Commit SHA: $COMMIT_SHA"
        echo "Commit Message: $COMMIT_MESSAGE"
    else
        echo "No new changes. Skipping deployment."
    fi
fi
