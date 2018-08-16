ARG FROM_IMAGE=mdillon/postgis:9.6
FROM ${FROM_IMAGE}

COPY ./healthcheck-db.sh /healthcheck.sh

# Data is not loaded at startup, so okay to have shorted start period
HEALTHCHECK \
    --interval=15s \
    --timeout=1s \
    --start-period=1m \
    --retriest=2
  CMD /healthcheck.sh