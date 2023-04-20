@Library('jenkins-shared-libraries')_
pipeline {
    agent {
        label 'runner'
    }

    options {
        disableConcurrentBuilds(abortPrevious: true)
    }

    environment {
        DEV_DOMAIN = 'alodev.org'
        NODE_MODULES_PATH = '/cached_modules/npm/talk2/node_modules'
        TERRAFORM_REPO = 'terraform-groundwork'
        TALK2_REPO = 'aloware-talk2'
        GITHUB_ORG = 'aloware'
        GIT_AUTH = credentials('jenkins-github-user')
        AWS_CREDS = credentials('aws-credentials')
        AWS_REGION = 'us-west-2'
    }

    stages {
        stage('Send Job Start Notification') {
            steps {
                script {
                    notificationSender.sendSlackInfo()
                }
            }
        }

        stage('Setup Dev Env File') {
            String text
            when { not { branch 'master' } }
            steps {
                withCredentials([file(credentialsId: 'talk2-dev-env', variable: 'dev_env')]) {
                   text = readFile(dev_env)
                   sh "cat ${dev_env} >> .env && cat ${dev_env} >> .env.prod"
                }

                println "${text}"
            }
        }

        stage('Load Cached Modules') {
            when { not { branch 'master' } }
            steps {
                sh "cp -r ${env.NODE_MODULES_PATH} ."
            }
        }

        stage('Install Dependencies') {
            when { not { branch 'master' } }
            steps {
                sh 'npm install --no-audit'
            }
        }

        stage('Build Talk2 Assets') {
            when { not { branch 'master' } }
            steps {
                sh 'quasar build'
            }
        }

        stage('Deploy New Dev-Env Cloudfront Distribution') {
            when { not { branch 'master' } }
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
                  def subDomain = branchName.contains('pr') ? "${branchName}.talk" : "talk"
                  def envUrl = "${subDomain}.${DEV_DOMAIN}"

                  dir("${WORKSPACE}/${TERRAFORM_REPO}/s3_cloudfront") {
                      sh """
                        terraform init; \
                        terraform validate; \
                        terraform fmt
                      """

                      try {
                        sh "terraform workspace new ${branchName}"
                      } catch (Exception e) {
                          echo "The workspace already exists, running TF Commands..."
                          sh "terraform workspace select ${branchName}"
                      }

                      sh "terraform apply -var environment='develop' -var domainName='${envUrl}' -var route53_zone='${DEV_DOMAIN}' --auto-approve;"
                  }

                  sh "aws --region ${AWS_REGION} --profile talk2-dev-deployer s3 sync ${WORKSPACE}/dist/spa s3://${envUrl}"
                }
            }
        }
    }
    post {
        success {
            script {
                notificationSender.sendSlackSuccess()
                try {
                  if (env.CHANGE_BRANCH) {
                    sh "echo ${GIT_AUTH_PSW} > tmp_token.txt"
                    sh "gh auth login --with-token < tmp_token.txt"
                    sh "gh pr comment ${env.CHANGE_BRANCH} --body 'Hi, your environment is ready to use at: https://${envUrl}' -R https://github.com/${GITHUB_ORG}/${TALK2_REPO}"
                  }
                } catch (Exception e) {
                    echo "We could not add the comment in Github PR. Error: " + e.toString() + ". Please check #dev-deployments channel in Slack for the environment URL."
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
