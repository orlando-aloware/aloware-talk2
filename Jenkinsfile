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
        TALK2_REPO = 'aloware-talk2'
        GITHUB_ORG = 'aloware'
        GIT_AUTH = credentials('jenkins-github-user')
        AWS_CREDS = credentials('aws-credentials')
        AWS_REGION = 'us-west-2'
    }

    stages {
        stage('Setup Dev Env File') {
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
                  def branchName = env.GIT_BRANCH.toLowerCase()
                  def envUrl = "${branchName}.talk.${DEV_DOMAIN}"

                  dir("${WORKSPACE}/${TERRAFORM_REPO}/s3_cloudfront") {
                      sh """
                        terraform init; \
                        terraform validate; \
                        terraform fmt
                      """

                      try {
                        sh "terraform workspace new ${branchName} && terraform workspace select ${branchName}"
                      } catch (Exception e) {
                          echo "The workspace already exists, running TF Commands..."
                          sh "terraform workspace select ${branchName}"
                      }

                      sh "terraform apply -var environment='develop' -var domainName='${envUrl}' -var route53_zone='${DEV_DOMAIN}' --auto-approve;"
                  }

                  sh "aws --region ${AWS_REGION} --profile talk2-dev-deployer s3 sync ${WORKSPACE}/dist/spa s3://${envUrl}"

                  echo '==> Add PR Comment';
                  script {

                  }
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
                try {
                  if (env.CHANGE_BRANCH) {
                    sh "echo ${GIT_AUTH_PSW} > tmp_token.txt && gh auth login --with-token < tmp_token.txt"
                    sh "gh pr comment ${env.CHANGE_BRANCH} --body 'Hi, your environment is ready to use at: https://${envUrl}' -R https://github.com/${GITHUB_ORG}/${TALK2_REPO}"
                  }
                } catch (Exception e) {
                    echo "We could not add the comment in Github PR for some reason, please check #dev-deployments channel in Slack for the environment URL."
                }
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
