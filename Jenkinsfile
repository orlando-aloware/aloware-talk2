@Library('jenkins-shared-libraries')_
pipeline {
    agent {
        label 'runner'
    }

    options {
        disableConcurrentBuilds()
    }

    environment {
        DEV_DOMAIN = 'alodev.org'
        PROD_DOMAIN = 'aloware.com'
        NODE_MODULES_PATH = '/cached_modules/npm/talk2/node_modules'
    }

    stages {
        stage('Setup Env for Testing') {
            steps {
                script {
                    notificationSender.sendSlackInfo()
                }

                withCredentials([file(credentialsId: 'talk2-dev-env', variable: 'dev_env')]) {
                   sh "cp ${dev_env} .env"
                }
            }
        }

        stage('Load Cached Modules') {
          steps {
            sh "cp -r ${env.NODE_MODULES_PATH} ."
          }
        }

        stage('Install Dependencies') {
          steps {
            sh 'npm install --no-audit'
          }
        }

        stage('Build Talk2 Assets') {
            steps {
                sh 'quasar build'
            }
        }

        stage('Deploy to Dev Environment') {
//             when { branch 'develop' }
            steps {
                sh "aws --region us-west-2 --profile talk2-deployer s3 sync ${WORKSPACE}/dist/spa s3://talk.${env.DEV_DOMAIN} --delete"
            }
        }
    }
    post {
        success {
            script {
                notificationSender.sendSlackSuccess()
            }
        }
        failure {
            script {
                notificationSender.sendSlackFailure()
            }
        }
        changed {
            script {
                if (currentBuild.currentResult == 'SUCCESS') {
                    echo 'Job Recovered'
                }
            }
        }
        always {
            //noInspection GroovyAssignabilityCheck
            cleanWs()
        }
    }
}
