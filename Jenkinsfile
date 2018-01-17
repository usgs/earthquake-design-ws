#!/usr/bin/env groovy

node {
  def SCM_VARS

  def BASE_IMAGE = "${GITLAB_INNERSOURCE_REGISTRY}/devops/containers/node:8"
  def DEPLOY_IMAGE = "${GITLAB_INNERSOURCE_REGISTRY}/ghsc/hazdev/earthquake-design-ws"
  def DEPLOY_VERSION = 'latest'
  def LOCAL_IMAGE = 'local/earthquake-design-ws:latest'


  try {
    stage('Setup') {
      def url
      def urlBase

      cleanWs()

      SCM_VARS = checkout scm

      if (GIT_BRANCH != '') {
        sh "git checkout --detach ${GIT_BRANCH}"

        SCM_VARS.GIT_BRANCH = GIT_BRANCH
        SCM_VARS.GIT_COMMIT = sh(
          returnStdOut: true,
          script: 'git rev-parse HEAD'
        )
      }

      // Determine deploy version tag to use
      if (SCM_VARS.GIT_BRANCH != 'origin/master') {
        DEPLOY_VERSION = SCM_VARS.GIT_BRANCH.split('/').last().replace(' ', '_')
      }

      urlBase = SCM_VARS.GIT_URL.replace('.git', '/commit/')
      url = "<a href=\"${urlBase}/${SCM_VARS.GIT_COMMIT}\" target=\"_blank\">${SCM_VARS.GIT_COMMIT}</a>"
      writeFile encoding: 'UTF-8', file: '.REVISION', text: "${url}"

      ansiColor('xterm') {
        sh """
          mkdir -p ${WORKSPACE}/coverage;
          mkdir -p ${WORKSPACE}/node_modules;
        """
      }
    }

    stage('Build Local Image') {
      ansiColor('xterm') {
        sh """
          docker rm ${LOCAL_IMAGE} || echo 'This is okay'
          docker build \
            --build-arg BASE_IMAGE=${BASE_IMAGE} \
            -t ${LOCAL_IMAGE} .
        """
      }
    }

    stage('Unit Tests') {
      docker.image(LOCAL_IMAGE).inside(
        "-v ${WORKSPACE}/coverage:/hazdev-project/coverage",
        "-v ${WORKSPACE}/node_modules:/hazdev-project/node_modules"
      ) {

        withEnv([
          'npm_config_cache=/tmp/npm-cache',
          'HOME=/tmp'
        ]) {
          ansiColor('xterm') {
            sh """
              source /etc/profile.d/nvm.sh > /dev/null 2>&1;
              npm config set package-lock false

              npm install
              npm run coverage
            """
          }
        }
      }
    }

  } catch (e) {
    currentBuild.result = "FAILED"
    mail to: 'emartinez@usgs.gov',
      from: 'noreply@jenkins',
      subject: "Jenkins Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      body: "Project build (${BUILD_TAG}) failed '${e}'"
    throw e
  }
}
