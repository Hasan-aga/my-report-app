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

## tests
Run with `npm test` from client/.

Tests written (one behavior each)
 1. Renders a card for every category in REPORT_DATA
 2. Selecting a category advances to step 1 and seeds findings
 3. Disables Next on step 0 until a category is selected
 4. Editing a finding to whitespace removes it from the list
 5. + Add Finding appends a new empty finding row
 6. Print does nothing when there are no findings
 7. Print calls PDFService.fillTemplate + printPDF with the correct payload
 8. Print surfaces an error Snackbar when PDFService throws
 9. Removing the last finding in card view clamps currentFindingIndex
10. Clicking the Settings icon invokes the onOpenSettings prop 

## todo

create self contained text editor and use it with speech rec.
cleanup the final page.
add option to print blank reports.
research offline speech to text options for ios and linux.
clicking anywhere in the finding's textarea triggers the mobile's keyboard.
simplify the interaction with findings (the delete symbol is too much).
create a history system for reports to prevent loss.
