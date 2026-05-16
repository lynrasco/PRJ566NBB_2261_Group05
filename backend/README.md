Backend Setup:

Requirements
Ensure each of the following are downloaded/installed prior to running the backend:

* Git
* VS Code (selected IDE)
* Node.js
* MongoDB Compass or MongoDB Atlas account
* VS Code extensions such as Prettier and ESLint

Running the backend

Follow these instructions to run the backend section of the project:

Clone the project repo

```bash
git clone <repo-url>
```

Go to backend directory

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Installed packages:

* express
* cors
* dotenv
* mongoose
* nodemon

Run the backend server

```bash
node server.js
```

or with nodemon:

```bash
npx nodemon server.js
```

The backend server should run on:

```text
http://localhost:3000
```

.gitignore

Ensure the project contains a `.gitignore` file in the root directory with:

```gitignore
node_modules/
.env
.vscode/
```
