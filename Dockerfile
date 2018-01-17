ARG BASE_IMAGE=usgs/hazdev-base-images:latest-node
FROM ${BASE_IMAGE}

# node-libcurl build dependencies
RUN yum groupinstall -y 'Development Tools' && \
    yum install -y libcurl-devel && \
    yum clean all

# Copy application (ignores set in .dockerignore) and set permissions
COPY . /hazdev-project
RUN chown -R hazdev-user:hazdev-user /hazdev-project

# Switch to hazdev-user
USER hazdev-user

# Configure application
RUN /bin/bash --login -c " \
        cd /hazdev-project && \
        export NON_INTERACTIVE=true && \
        npm config set package-lock false \
        npm install && \
        rm -rf \
            $HOME/.npm \
            /tmp/npm* \
        "


WORKDIR /hazdev-project
EXPOSE 8000
CMD [ "/hazdev-project/src/lib/docker-entrypoint.sh" ]
