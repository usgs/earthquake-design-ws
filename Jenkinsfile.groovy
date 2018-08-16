#!/usr/bin/env groovy

node {
  def APP_NAME = 'earthquake-design-ws'
  def DEVOPS_REGISTRY = "${GITLAB_INNERSOURCE_REGISTRY}/devops/images"
  def FAILURE = null
  def SCM_VARS = null
  
  def DEPLOY_BASE = "${GITLAB_INNERSOURCE_REGISTRY}/ghsc/hazdev/${APP_NAME}"
  def IMAGE_VERSION = 'latest'

  def DB_BASE_IMAGE = "${DEVOPS_REGISTRY}/mdillon/postgis:9.6"
  def DB_DEPLOY_IMAGE = "${DEPLOY_BASE}/db"
  def DB_LOCAL_IMAGE = "local/${APP_NAME}/db"
  
  def WS_BASE_IMAGE = "${DEVOPS_REGISTRY}/usgs/node:8"
  def WS_CONTAINER = "${APP_NAME}-${BUILD_ID}-PENTEST"
  def WS_DEPLOY_IMAGE = "${DEPLOY_BASE}/ws"
  def WS_LOCAL_IMAGE = "local/${APP_NAME}/ws"

  def OWASP_CONTAINER = "${APP_NAME}-${BUILD_ID}-OWASP"
  def OWASP_IMAGE = "${DEVOPS_REGISTRY}/owasp/zap2docker-stable"

  def SCAN_AND_BUILD_TASKS = [:]


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
          returnStdout: true,
          script: 'git rev-parse HEAD'
        )
      }

      // Determine deploy version tag to use
      if (SCM_VARS.GIT_BRANCH != 'origin/master') {
        IMAGE_VERSION = SCM_VARS.GIT_BRANCH.split('/').last().replace(' ', '_')
      }

      urlBase = SCM_VARS.GIT_URL.replace('.git', '/commit')
      url = "<a href=\"${urlBase}/${SCM_VARS.GIT_COMMIT}\" target=\"_blank\">${SCM_VARS.GIT_COMMIT}</a>"
      writeFile encoding: 'UTF-8', file: '.REVISION', text: "${url}"

      ansiColor('xterm') {
        sh """
          mkdir -p \
            ${WORKSPACE}/coverage \
            ${WORKSPACE}/owasp-data \
          ;

          chmod -R 777 \
            ${WORKSPACE}/coverage \
            ${WORKSPACE}/owasp-data \
          ;
        """
      }
    }

    SCAN_AND_BUILD_TASKS["Scan Dependencies"] = {
      stage('Scan Dependencies') {
        docker.image(WS_BASE_IMAGE).inside() {
          // Create dependencies
          withEnv([
            'npm_config_cache=/tmp/npm-cache',
            'HOME=/tmp',
            'NON_INTERACTIVE=true'
          ]) {
            ansiColor('xterm') {
              sh """
                source /etc/profile.d/nvm.sh > /dev/null 2>&1;
                npm config set package-lock false;

                # Using --production installs dependencies but not devDependencies
                npm install --production
              """
            }
          }

          ansiColor('xterm') {
            dependencyCheckAnalyzer(
              datadir: '',
              hintsFile: '',
              includeCsvReports: false,
              includeHtmlReports: true,
              includeJsonReports: false,
              includeVulnReports: true,
              isAutoupdateDisabled: false,
              outdir: 'dependency-check-data',
              scanpath: "${WORKSPACE}",
              skipOnScmChange: false,
              skipOnUpstreamChange: false,
              suppressionFile: '',
              zipExtensions: ''
            )
          }

          // Publish results
          dependencyCheckPublisher(
            canComputeNew: false,
            defaultEncoding: '',
            healthy: '',
            pattern: '**/dependency-check-report.xml',
            unHealthy: ''
          )

          publishHTML (target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'dependency-check-data',
            reportFiles: 'dependency-check-report.html',
            reportName: 'Dependency Analysis'
          ])

          publishHTML (target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'dependency-check-data',
            reportFiles: 'dependency-check-vulnerability.html',
            reportName: 'Dependency Vulnerabilities'
          ])
        }
      }
    }

    SCAN_AND_BUILD_TASKS["Build Image"] = {
      stage('Build Image') {
        ansiColor('xterm') {
          sh """
            docker build \
              --no-cache \
              --file ws.Dockerfile \
              --build-arg BASE_IMAGE=${WS_BASE_IMAGE} \
              -t ${WS_LOCAL_IMAGE} .
          """
          sh """
            docker build \
              --no-cache \
              --file db.Dockerfile \
              --build-arg BASE_IMAGE=${DB_BASE_IMAGE} \
              -t ${DB_LOCAL_IMAGE} .
          """
        }
      }
    }

    parallel SCAN_AND_BUILD_TASKS


    stage('Unit Tests / Coverage') {
      ansiColor('xterm') {
        sh """
          docker run --rm \
            -v ${WORKSPACE}/coverage:/hazdev-project/coverage \
            ${WS_LOCAL_IMAGE} \
            /bin/bash --login -c 'npm run coverage'
        """
      }

      cobertura(
        autoUpdateHealth: false,
        autoUpdateStability: false,
        coberturaReportFile: '**/cobertura-coverage.xml',
        conditionalCoverageTargets: '70, 0, 0',
        failUnhealthy: false,
        failUnstable: false,
        lineCoverageTargets: '80, 0, 0',
        maxNumberOfBuilds: 0,
        methodCoverageTargets: '80, 0, 0',
        onlyStable: false,
        sourceEncoding: 'ASCII',
        zoomCoverageChart: false
      )
    }

    stage('Penetration Tests') {
      def ZAP_API_PORT = '8090'
      def SCAN_URL_BASE = 'http://application:8000/ws/designmaps'

      // Start a container to run penetration tests against
        docker run --rm --name ${WS_CONTAINER} \
      sh """
          -d ${WS_LOCAL_IMAGE}
      """

      // Start a container to execute OWASP PENTEST
      sh """
        docker run --rm -d -u zap \
          --link=${WS_CONTAINER}:application \
          --name=${OWASP_CONTAINER} \
          -v ${WORKSPACE}/owasp-data:/zap/reports:rw \
          -i ${OWASP_IMAGE} \
          zap.sh \
          -daemon \
          -port ${ZAP_API_PORT} \
          -config api.disablekey=true
      """

      // Wait for OWASP container to be ready, but not for too long
      timeout(
        time: 20,
        unit: 'SECONDS'
      ) {
        echo 'Waiting for OWASP container to finish starting up'
        sh """
          set +x
          status='FAILED'
          while [ \$status != 'SUCCESS' ]; do
            sleep 1;
            status=`\
              (\
                docker exec -i ${OWASP_CONTAINER} \
                  curl -I localhost:${ZAP_API_PORT} \
                  > /dev/null 2>&1 && echo 'SUCCESS'\
              ) \
              || \
              echo 'FAILED'\
            `
          done
        """
      }

      // Run the penetration tests
      ansiColor('xterm') {
        sh """
          # Setup
          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} open-url \
            ${SCAN_URL_BASE}/

          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} spider \
            ${SCAN_URL_BASE}/


          # Active Scan
          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} active-scan \
            ${SCAN_URL_BASE}/


          # Quick Scans
          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} quick-scan \
            ${SCAN_URL_BASE}/deterministic.json > /dev/null

          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} quick-scan \
            ${SCAN_URL_BASE}/probabilistic.json > /dev/null

          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} quick-scan \
            ${SCAN_URL_BASE}/risk-coefficient.json > /dev/null

          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} quick-scan \
            ${SCAN_URL_BASE}/site-amplification.json > /dev/null

          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} quick-scan \
            ${SCAN_URL_BASE}/t-sub-l.json > /dev/null


          # Alerts / Reports
          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} alerts

          docker exec ${OWASP_CONTAINER} \
            zap-cli -v -p ${ZAP_API_PORT} report \
            -o /zap/reports/owasp-zap-report.html -f html
          docker stop ${OWASP_CONTAINER} ${WS_CONTAINER}

        """
      }

      // Publish results
      publishHTML (target: [
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: "${WORKSPACE}/owasp-data",
        reportFiles: 'owasp-zap-report.html',
        reportName: 'OWASP ZAP Report'
      ])
    }


    stage('Publish Image') {
      docker.withRegistry(
        "https://${GITLAB_INNERSOURCE_REGISTRY}",
        'innersource-hazdev-cicd'
      ) {
        ansiColor('xterm') {
          sh """
            docker tag \
              ${WS_LOCAL_IMAGE} \
              ${WS_DEPLOY_IMAGE}:${IMAGE_VERSION}

            docker tag \
              ${DB_LOCAL_IMAGE} \
              ${DB_DEPLOY_IMAGE}:${IMAGE_VERSION}
          """

          sh """
            docker push ${WS_DEPLOY_IMAGE}:${IMAGE_VERSION}
            docker push ${DB_DEPLOY_IMAGE}:${IMAGE_VERSION}
          """
        }
      }
    }

    stage('Trigger Deploy') {
      build(
        job: 'deploy-ws',
        parameters: [
          string(name: 'WS_IMAGE_VERSION', value: IMAGE_VERSION),
          string(name: 'DB_IMAGE_VERSION', value: IMAGE_VERSION)
        ],
        propagate: false,
        wait: false
      )
    }
  } catch (e) {
    mail to: 'gs-haz_dev_team_group@usgs.gov',
      from: 'noreply@jenkins',
      subject: "Jenkins Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      body: "Project build (${BUILD_TAG}) failed '${e}'"

    FAILURE = e
  } finally {
    stage('Cleanup') {
      sh """
        set +e;

        docker container stop \
          ${WS_CONTAINER} \
          ${OWASP_CONTAINER} \
        2> /dev/null;

        docker container rm --force \
          ${WS_CONTAINER} \
          ${OWASP_CONTAINER} \
        2> /dev/null;

        exit 0;
      """

      if (FAILURE) {
        currentBuild.result = 'FAILURE'
        throw FAILURE
      }
    }
  }
}
