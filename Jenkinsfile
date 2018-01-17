#!/usr/bin/env groovy

node {
  try {
    stage('Setup') {
      cleanWs()

      SCM_VARS = checkout scm

      SCM_VARS.each { key, value ->
        echo "SCM_VARS[${key}] = ${SCM_VARS[${value}]}"
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
