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
        stage('Setup Dev Env File') {
//             when { branch 'develop' }
            steps {
                script {
                    notificationSender.sendSlackInfo()
                }

                withCredentials([file(credentialsId: 'talk2-dev-env', variable: 'dev_env')]) {
                   sh "cat ${dev_env} >> .env"
                }
            }
        }

        stage('Setup Prod Env File') {
            when { branch 'master' }
            steps {
                withCredentials([file(credentialsId: 'talk2-prod-env', variable: 'prod_env')]) {
                   sh "cat ${prod_env} >> .env"
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
                sh "aws --region us-west-2 --profile talk2-dev-deployer s3 sync ${WORKSPACE}/dist/spa s3://talk.${env.DEV_DOMAIN} --delete"
            }
        }

        stage('Deploy to Prod Environment') {
            when { branch 'master' }
            steps {
                sh "aws --region us-west-2 --profile talk2-prod-deployer s3 sync ${WORKSPACE}/dist/spa s3://talk.${env.PROD_DOMAIN} --delete"
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
