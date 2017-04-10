# earthquake-design-ws
Web service provided by the U.S. Geological Survey for computing seismic
design parameters compatible with various building code reference documents.

[![Build Status](https://travis-ci.org/usgs/earthquake-design-ws.svg?branch=master)](https://travis-ci.org/usgs/earthquake-design-ws)
[![Coverage](https://codecov.io/github/usgs/earthquake-design-ws/coverage.svg?branch=master)](https://codecov.io/github/usgs/earthquake-design-ws?branch=master)

Using the Generated Project
---------------------------

## Getting Started
- run `npm install` to install application development dependencies
    - The application will prompt you for configuration information,
      and create a file named `src/conf/config.json` in the project.
- run `npm run dev` from the install directory


## Docker

### Building an image

- From root of project, run:
    ```
    docker build -t usgs/earthquake-design-ws:latest .
    ```

### Running a container

When initially creating a container from the base image, you must provide
several configuration parameters based on your working environment.

- Required configuration
  - `MOUNT_PATH`: The base URL path on which to listen for requests. This can
                  be any path, or an empty path to listen on slash "/".
  - `PORT`: The port number on which to listen for connections. This can be
            any available port on the host system.
  - `LEGACY_URL`: Fetches design data in legacy format.
                  Example: https://earthquake.usgs.gov/designmaps/beta/us/service

- Start the container using the image tag.

  > In the command below, replace values in brackets `{VALUE}` with the
  > corresponding configuration value determined above.

    ```
    docker run -d
      --name earthquake-design-ws \
      -p {PORT}:8000 \
      -e MOUNT_PATH={MOUNT_PATH} \
      -e LEGACY_URL={LEGACY_URL} \
      usgs/earthquake-design-ws:latest
    ```

  > Alternatively you may use `docker-compose` to start the container. Prior to
  > starting the container you should update the relevant configuration
  > information in the docker-compose.yml file and then run the command:
    ```
    dockker-compose up -d
    ```

- Connect to the running container in browser.

  > In the URL below, replace values in brackets `{VALUE}` with the
  > corresponding configuration value determined above.

  ```
  http://localhost:{PORT}{MOUNT_PATH}
  ```

- Stopping and starting the container. Once you have successfully created
  and configured a container from a base image (above), you can subsequently
  start and stop the container with the following commands.
  ```
  docker stop earthquake-design-ws
  docker start earthquake-design-ws
  docker restart earthquake-design-ws
  ```

  If you created the container using the `docker-compose` method, you can
  start and stop the container with the following commands instead:
  ```
  docker-compose stop
  docker-compose start
  docker-compose restart
  ```
