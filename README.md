# Report Generator Application

A web application for generating and printing reports from selected data.

## Project Structure

this project is made up of:

1. An ExpressJs backend server: which serves the client and the pdf template.
2. A React client (created with Vite) which presents user with some data and enables editing and printing that data.

We also have a deployment script that builds the docker images.

## Getting started

To install the app we have a Docker Compose file that spins up two containers (server & client):

```
docker compose up --build -d
```

You can then visit your app at http://localhost:80
The app gets a pdf template from its backend and fills that template with data. this data is currently hardcoded in the client source code (config.js).

## Development Setup Instructions

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5002

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Client will run on http://localhost:5001
