## Docker file to build app as container

FROM usgs/hazdev-base-images:latest-node as node-libcurl-build
#FROM usgs/hazdev-base-images:latest-node

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
        npm install && \
        rm -rf \
            $HOME/.npm \
            /tmp/npm* \
        "


## Docker file to build app as container

FROM usgs/hazdev-base-images:latest-node
MAINTAINER "Eric Martinez" <emartinez@usgs.gov>
LABEL dockerfile_version="v0.1.1"

# Copy application (ignores set in .dockerignore) and set permissions
COPY --from=node-libcurl-build /hazdev-project /hazdev-project
RUN chown -R hazdev-user:hazdev-user /hazdev-project

# Switch to hazdev-user
USER hazdev-user


WORKDIR /hazdev-project
EXPOSE 8000
CMD [ "/hazdev-project/src/lib/docker-entrypoint.sh" ]
