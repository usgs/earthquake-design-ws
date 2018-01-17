#!/usr/bin/env groovy

node {
  def SCM_VARS

  try {
    stage('Setup') {
      cleanWs()

      SCM_VARS = checkout scm

      echo 'SCM_VARS...'
      SCM_VARS.each { key, value ->
        println "  ${key} = ${value}"
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
