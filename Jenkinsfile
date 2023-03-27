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
        TERRAFORM_REPO = 'terraform-groundwork'
        GITHUB_ORG = 'aloware'
        AWS_CREDS = credentials('aws-credentials')
        AWS_REGION = '${AWS_REGION}'
    }

    stages {
        stage('Setup Dev Env File') {
            when { branch 'develop' }
            steps {
                script {
                    notificationSender.sendSlackInfo()
                }

                withCredentials([file(credentialsId: 'talk2-dev-env', variable: 'dev_env')]) {
                   sh "cat ${dev_env} >> .env && cat ${dev_env} >> .env.prod"
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

        stage('Deploy New Dev-Env Cloudfront Distribution') {
            steps {
                sshagent(credentials: ['jenkins-github-creds']) {
                  echo '==> Clone GitOps Repo';
                  sh ("""
                    [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                    ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
                    git clone git@github.com:${GITHUB_ORG}/${TERRAFORM_REPO}.git
                  """);
                }

                sh "export AWS_ACCESS_KEY_ID='${AWS_CREDS_USR}'; export AWS_SECRET_ACCESS_KEY='${AWS_CREDS_PSW}'; export AWS_REGION='${AWS_REGION}'"

                script {
                  dir("${WORKSPACE}/${API_CORE_GITOPS}/s3_cloudfront") {
                      sh '''
                        terraform init; \
                        terraform validate; \
                        terraform fmt
                      '''

                      try {
                        sh "terraform workspace new ${utils.taskName(env.GIT_BRANCH)}"
                      } catch (Exception e) {
                        echo "The workspace already exists, running TF Commands..."
                      }

                      sh '''
                        export TF_environment=develop
                        export TF_domainName="${utils.taskName(env.GIT_BRANCH)}.${DEV_DOMAIN}"
                        export TF_route53_zone=${DEV_DOMAIN}
                        terraform apply --auto-approve;
                      '''
                  }

                  sh "aws --region ${AWS_REGION} --profile talk2-dev-deployer s3 sync ${WORKSPACE}/dist/spa s3://${utils.taskName(env.GIT_BRANCH)}.${DEV_DOMAIN}"
                }
            }
        }

        stage('Deploy to Dev Environment') {
            when { branch 'develop' }
            steps {
                sh "aws --region ${AWS_REGION} --profile talk2-dev-deployer s3 sync ${WORKSPACE}/dist/spa s3://talk.${env.DEV_DOMAIN} --delete"
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
