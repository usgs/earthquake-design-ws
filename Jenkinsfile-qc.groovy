#!/usr/bin/env groovy

node {
  def TARGET_WEB_NODES = DEVELOPMENT_WEB_NODES


  // Determine set of hosts to run against
  if (ENVIRONMENT.toUpperCase() == 'PRODUCTION') {
    TARGET_WEB_NODES = PRODUCTION_WEB_NODES
  }

  TARGET_WEB_NODES = readJSON text: TARGET_WEB_NODES


  stage('Setup') {
    cleanWs()

    sh """
      mkdir -p ${WORKSPACE}/qc-results;
      chmod -R 777 ${WORKSPACE}/qc-results;
    """
  }

  stage('Quality Control Checks') {
    def TASKS = [:]

    TARGET_WEB_NODES.each { host ->
      TASKS[host] = {
        sh """
          docker run --rm \
            -v ${WORKSPACE}/qc-results:/hazdev-project/qc-results:rw \
            ${GITLAB_INNERSOURCE_REGISTRY}/ghsc/hazdev/earthquake-design-ws:${IMAGE_VERSION} \
            /bin/bash --login -c 'node qc/smoketest.js http://${host} >> qc-results/${host}.txt'
        """

        publishHTML (target: [
          allowMissing: true,
          alwaysLinkToLastBuild: true,
          keepAll: true,
          reportDir: "${WORKSPACE}/qc-results",
          reportFiles: "${host}.txt",
          reportName: "${host} QC Results"
        ])
      }
    }

    parallel TASKS
  }
}
