# Software Testing 2024-25 Sample Project

**This is the sample test project for Software Testing Course 2024-25 at the University of Edinburgh**.

The project exposes an API related to operations regarding User registration, authentication and usage, allowing a simple order placement of predefined boxes of an imaginary food shop under a limited amount of choices (`Box1` and `Box2`). The system also poses different user access levels (`Admin` and `User`), with elevated permissions to the administrator and respective restrictions to the simple user.

The project is written in JavaScript (utilizing some of ES6 such as destructuring and `async/await` instead of promises, while keeping some of CommonJS traits, such as module loading via `require`), utilizing `Node.js` engine. In addition, `MongoDB` is utilized for the Database, and `Mongoose` package is utilized for usage in the project (DB schema definition, CRUD operations).

The system utilizes `JWT` for authentication and `Bcrypt` for password encryption.
The system utilizes `Express` package for API buildup. 

For testing purposes, we utilize `Jest` for Unit & Integration Tests. Although a UI interface is not included, you can always build a UI on top of the system and utilize additional frameworks for testing, such as `Puppeteer`.

In addition, for performance testing and metrics reporting, we utilize [`Artillery`](https://www.artillery.io/).

## Prerequisites
[`Node.js`]("https://nodejs.org/en/"), [`MongoDB`]("https://www.mongodb.com/") and `npm` package need to be installed in your system.

## Setup Instructions
Setup by running `npm install` in the project folder.
This will generate a `node_modules` folder in your project folder containing all necessary packages.
Following that, and given you have downloaded and installed `MongoDB`, start it by doing `sudo systemctl start mongod`.
Once `MongoDB` is initiated, you can start your server by running `node server.js`.

## File Structure

```bash
├── .env.local | The local configuration file
├── .env | The configuration file used on CI.
├── db-cleanup.js | A script for DB cleanup
├── docker-compose.yml | Docker services composition file, used on CI.
├── Dockerfile | Main application Docker file, used on CI.
├── endpoints | Application Endpoint modules.
│   ├── auth.js
│   ├── orders.js
│   └── users.js
├── jest.config.js | Tests setup.
├── models | Mongoose DB schema definition modules
│   ├── order.js
│   └── user.js
├── package.json | Package installation and app setup file.
├── README.md
├── server.js | Main server file.
├── TestDockerfile | Test image on Docker creation file.
└── __tests__ | Test files, structured by functionality.
    ├── api
    │   ├── api.users-admin.test.js
    │   ├── api.users-generic.test.js
    │   └── api.users-simple.test.js
    ├── app
    │   ├── app.performance.test.js
    │   └── app.unit.test.js
    ├── db
    │   └── db.test.js
    ├── performance | Tests used for performance runs.
    │   ├── performance-helper.js
    │   └── performance-test.yml
    └── setup | Tests Setup/Teardown helper files.
        ├── setup.js
        ├── teardown.js
        └── test-helper.js
```

## Run Instructions
Before setting up the project, make sure that MongoDB is setup, by running:

```
sudo systemctl status mongod
```

You can start it by doing `sudo systemctl start mongod`, or stop it by doing `sudo systemctl stop mongod`.

To setup the server locally, run `node server.js`. The project will start.
You can then setup options such as port in the respective configuration file.

Keep in mind that you will need to use the *local* configuration, therefore it is recommended
thet you rename `.env.local` file to `.env` (discarding or renaming the existing `.env` file which relates to CI), configure your system so that it utilizes `.env.local` before you start the server locally or ignore local changes on `.env`file and rename the `.env.local`.

To execute Unit/Integration tests, run `npm test`.
Tests will then be executed and results will be displayed on console.

To execute Performance tests, run `npm run performance`.
Performance stress tests will then run and results will be displayed on console, but also be exported in `JSON` format in `performance.json` file on the base project folder.

To generate a report of performance results after their run, you can run `npm run report`.
This will automatically generate an `html` file, visually presenting the results in diagrams and statistics.

## Configuration
You can configure a certain number of parameters, such as system port and auth key secret at your `.env` configuration file.

## DB Cleanup
The test suite contains setup and teardown logic, leaving the database in a clean state after each run.

However, in case you ended up with a database containing unwanted test entries, you can clean it all up by running `node db-cleanup.js`.

## Continuous Integration
In order to setup the application for Continuous Integration tests execution (which are all tests, excluding the ones for performance), we have included some Docker files related to it to the project. However, you need to make a number of steps in order to prepare your project to CI/CD. We used `Gitlab CI` in order to do so, but you are free to choose another technology in case you want to do so:

*Disclaimer: All actions are proposed in order to setup the project and are just suggestions. Since they require applying sudo permissions to processes. Use at your own risk and discretion. It is highly recommended not to do it on any device containing sensitive data.*

1. Clone the project to a new Gitlab repository.
2. Enable CI/CD in your project. You can find directions [here](https://docs.gitlab.com/ee/ci/enable_or_disable_ci.html).
3. Register a Gitlab Runner in a machine you wish to run it. Once again, you can follow the instructions provided in the [official Gitlab documentation](https://docs.gitlab.com/runner/register/). When prompted to insert image for the runner, insert `docker`.
4. Grant elevated permissions to the runner by modifying the `config.toml` file and setting `privileged = true` and `volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]`. An indicated location for the runner is `/etc/
-runner`.
5. Install Docker and Docker Compose ([instructions here](https://docs.docker.com/engine/install/)) in that same machine, and set their permissions so that they can run without sudo command - so that they can be utilized by the CI pipeline on the runner.
6. Start gitlab runner by running `sudo gitlab-runner start`.
7. Setup a local docker network on your device, with the name "mynetwork". You can do so by running `docker network create mynetwork`. This is crucial, as otherwise your docker components will not be able to communicate each other.
8. Important note: make sure that your local `mongodb` instance or any other local service does not run on the same port with the one the docker containers are setup to run, as you will end up having conflicts. By default, we have setup the port `3000` for our API app, and `27017` for our `mongodb` instance.
9. You are all set! Commit to your repo and you should see the runner running your CI pipeline and the tests passing, upon successful installation.

## Troubleshooting
Here are some common issues that you might encounter with potential solution suggestions on how to resolve them on setup.
These are indicative however, and you might need to search deeper on each issue.

1. The project seems freeze upon start, not receiving any connections, and just giving me a warning.
*Suggestion:* Make sure that `mongodb` service has started, and that the `.env` file you use is for local use and not CI. The default `.env` file is for CI use, so if you want to run and test your application locally, you need to rename `.env` (e.g., to `.env.ci`) and consecutively, also rename `.env.local` to `.env`. You can also setup `.gitignore` so that you don't push the local file to your repo as well. You can also determine which file is for which usage, by checking the `NOTE` field in each file.
2. When running the project on GitLab CI, it tells me that address `3000`, `27017`, or any other, is in use.
*Suggestion:* If you setup your runner in the same machine with your local development, make sure that the ports of the applications that you use locally do not interfere with the CI runs, as the runner essentially will run the tests on your machine.
3. The CI gives me a 4XX error - e.g., 409.
*Suggestion:* Clean your database using the script provided - your DB is left in an inconsistent state.
4. The CI runner seems to be stuck.
*Suggestion:* Check if an existing failing pipeline is still running and stop it. If the problem persists, attempt (1) to pause and resume the runner from Gitlab settings, (2) to remove and reinstall a new runner, following the instructions above. Make sure your runner is also up and running in the machine setting up.
5. I receive lots of connection refused errors, towards MongoDB.
*Suggestion:* Check if you have setup docker network.
6. I cannot find the `config.toml` file.
*Suggestion:* Given your configuration (e.g., if you installed the runner with `sudo`), locations might vary. Check [this SO question](https://stackoverflow.com/questions/72269656/gitlab-runner-configuration-not-showing-in-config-toml) for more info.
7. My CI pipeline step seems to have failed.
*Suggestion:* Using Gitlab CI pipeline interface, you can open the necessary step and read about the cause of failure.

**Disclaimer: This software is provided "as-is", with no guarantees. The developer makes no other warranties, express or implied, and hereby disclaims all implied warranties, including any warranty of merchantability and warranty of fitness for a particular purpose. The project is provided for educational purposes, and are no guarantees of any kind  that it is fault-free, despite the best of efforts and intentions of its developer to provide a comprehensive and stable result.**
