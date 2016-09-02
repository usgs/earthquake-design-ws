## Docker file to build app as container

FROM debian:latest
MAINTAINER "Eric Martinez" <emartinez@usgs.gov>
LABEL dockerfile_version="v0.1.0"


# install dependencies
RUN apt-key update -y && \
    apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        libaio1 && \
    apt-get clean

# install nvm
RUN export NVM_DIR="/nvm" && \
    curl -o- \
       https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh \
       | /bin/bash && \
    echo 'export NVM_DIR=/nvm' >> /etc/profile.d/nvm.sh && \
    echo '. ${NVM_DIR}/nvm.sh' >> /etc/profile.d/nvm.sh && \
    /bin/bash --login -c "nvm install 4.5.0"


# copy application (ignores set in .dockerignore)
COPY . /hazdev-project


# create non-root user
RUN useradd \
        -c 'Docker image user' \
        -m \
        -r \
        -s /sbin/nologin \
        -U \
        hazdev-user && \
    chown -R hazdev-user:hazdev-user /hazdev-project


# switch to hazdev-user
USER hazdev-user


# configure application
RUN /bin/bash --login -c " \
        cd /hazdev-project && \
        export NON_INTERACTIVE=true && \
        npm install && \
        rm -rf \
            $HOME/.npm \
            /tmp/npm* \
        "


WORKDIR /hazdev-project
EXPOSE 8000
CMD [ "/hazdev-project/src/lib/docker-entrypoint.sh" ]
