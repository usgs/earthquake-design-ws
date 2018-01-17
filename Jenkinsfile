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
    email
      body: "${env.BUILD_URL}",
      replyTo: 'emartinez@usgs.gov',
      subject: "Jenkins Build Failed: Job: ${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to: 'emartinez@usgs.gov'
    throw e
  }
}
