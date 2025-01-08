@Library('jenkins-shared-libraries')_
pipeline {
    agent any

    options {
        disableConcurrentBuilds(abortPrevious: true)
    }

    environment {
        DEV_DOMAIN = 'alodev.org'
        TERRAFORM_REPO = 'terraform-groundwork'
        TALK2_REPO = 'aloware-talk2'
        GITHUB_ORG = 'aloware'
        GIT_AUTH = credentials('jenkins-github-user')
        AWS_CREDS = credentials('aws-credentials')
        AWS_REGION = 'us-west-2'
        NODE_VERSION = '20'
        SAFE_JOB_NAME = "${env.JOB_NAME.replaceAll('/', '-').toLowerCase()}"
        CACHE_FOLDER = "${HOME}/.jenkins-cache/${SAFE_JOB_NAME}"
        YARN_CACHE_FOLDER = "${CACHE_FOLDER}/yarn"
        ARTIFACTS_CACHE_FOLDER = "${CACHE_FOLDER}/artifacts"
        DEVELOP_SAFE_JOB_NAME = "${JOB_NAME.split('/')[0]}-develop"
        DEVELOP_CACHE_FOLDER = "${HOME}/.jenkins-cache/${DEVELOP_SAFE_JOB_NAME}"
        TALK_URL = "${env.GIT_BRANCH.toLowerCase().contains('pr') ? "${env.GIT_BRANCH.toLowerCase()}.talk" : 'talk'}.${DEV_DOMAIN}"

        // Fill this with the URL of the MDE instance, for example https://pr-9331.mde.alodev.org to be able to use this Talk PR with MDE.
        // REMOVE BEFORE MERGING TO develop/master
        API_URL_OVERWRITE = ''
    }

    stages {
        stage('Build and Analysis') {
            parallel {
                stage('Build and deployment') {
                    stages {
                        stage('Send Job Start Notification') {
                            steps {
                                script {
                                    notificationSender.sendSlackInfo()
                                }
                            }
                        }

                        stage ('Setup Cache') {
                            steps {
                                script {
                                    // Create the cache directory
                                    sh "mkdir -p ${CACHE_FOLDER}"

                                    // Attempt to restore node_modules, from the cache directory of this job
                                    if (fileExists("${ARTIFACTS_CACHE_FOLDER}/node_modules")) {
                                        sh "rsync -a ${ARTIFACTS_CACHE_FOLDER}/node_modules ."
                                    }

                                    // If the directories wers not restored, attempt to restore from the develop branch artifacts
                                    if (!fileExists("node_modules")) {
                                        if (fileExists("${DEVELOP_CACHE_FOLDER}/artifacts/node_modules")) {
                                            sh "rsync -a ${DEVELOP_CACHE_FOLDER}/artifacts/node_modules ."
                                        }
                                    }

                                    // If this job has no cache, attempt to restore from the develop branch cache
                                    if (!fileExists("{YARN_CACHE_FOLDER}")) {
                                        if (fileExists("${DEVELOP_CACHE_FOLDER}/yarn")) {
                                            sh "rsync -a ${DEVELOP_CACHE_FOLDER}/yarn ."
                                        }
                                    }
                                }
                            }
                        }

                        stage('Setup environment') {
                            steps {
                                nvm("${NODE_VERSION}") {
                                    sh 'npm i -g yarn'
                                }
                            }
                        }

                        stage('Setup Dev Env File') {
                            when { not { branch 'master' } }
                            steps {
                                script {
                                    //String text
                                    withCredentials([file(credentialsId: 'talk2-dev-env', variable: 'dev_env')]) {
                                        // text = readFile(dev_env)
                                        sh "cat ${dev_env} >> .env && cat ${dev_env} >> .env.prod"
                                    }

                                    // If the API_URL_OVERWRITE is set, we will replace the API_URL in the .env file
                                    if (env.API_URL_OVERWRITE) {
                                        sh "sed -i 's|API_URL=.*|API_URL=${env.API_URL_OVERWRITE}|' .env"
                                    }

                                // println "${text}"
                                }
                            }
                        }

                        stage('Install Dependencies') {
                            when { not { branch 'master' } }
                            steps {
                                nvm("${NODE_VERSION}") {
                                    sh "yarn install --cache-folder ${YARN_CACHE_FOLDER} --pure-lockfile"
                                }
                            }
                        }

                        stage('Build Talk2 Assets') {
                            when { not { branch 'master' } }
                            steps {
                                nvm("${NODE_VERSION}") {
                                    sh 'quasar build --debug'
                                }
                            }
                        }

                        stage('Save Cache (node_modules)') {
                            steps {
                                sh '''
                                    mkdir -p ${ARTIFACTS_CACHE_FOLDER}
                                    if [ -d "node_modules" ]; then
                                        rsync -a node_modules ${ARTIFACTS_CACHE_FOLDER}
                                    else
                                        echo "node_modules directory not found, skipping cache"
                                    fi
                                '''
                            }
                        }

                        stage('Deploy New Dev-Env Cloudfront Distribution') {
                            when { not { branch 'master' } }
                            steps {
                                sshagent(credentials: ['jenkins-github-creds']) {
                                    echo '==> Clone GitOps Repo'
                                    sh("""
                                    [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                                    ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
                                    git clone git@github.com:${GITHUB_ORG}/${TERRAFORM_REPO}.git
                                """)
                                }

                                sh "export AWS_ACCESS_KEY_ID='${AWS_CREDS_USR}'; export AWS_SECRET_ACCESS_KEY='${AWS_CREDS_PSW}'; export AWS_REGION='${AWS_REGION}'"

                                script {
                                    def branchName = env.GIT_BRANCH.toLowerCase()
                                    def subDomain = branchName.contains('pr') ? "${branchName}.talk" : 'talk'

                                    dir("${WORKSPACE}/${TERRAFORM_REPO}/s3_cloudfront") {
                                        sh '''
                                        terraform init; \
                                        terraform validate; \
                                        terraform fmt
                                    '''

                                        try {
                                            sh "terraform workspace new ${branchName}"
                                    } catch (Exception e) {
                                            echo 'The workspace already exists, running TF Commands...'
                                            sh "terraform workspace select ${branchName}"
                                        }

                                        sh "terraform apply -var environment='develop' -var domainName='${TALK_URL}' -var route53_zone='${DEV_DOMAIN}' --auto-approve;"
                                    }

                                    sh "yarn upload-s3"
                                }
                            }
                        }
                    }
                }

                stage('Sonar Analysis') {
                    when {
                        anyOf {
                            branch 'master';
                            branch 'develop'
                        }
                    }
                    steps {
                        script {
                            sh 'git rev-parse --abbrev-ref HEAD'
                            def scannerHome = tool 'SonarQube Tool'
                            withSonarQubeEnv('Sonar') {
                                sh "${scannerHome}/bin/sonar-scanner"
                            }
                        }
                    }
                }
            }
        }
    }
    post {
        success {
            script {
                def branchName = env.GIT_BRANCH.toLowerCase()
                def subDomain = branchName.contains('pr') ? "${branchName}.talk" : 'talk'

                notificationSender.sendSlackSuccess()
                try {
                    if (env.CHANGE_BRANCH) {
                        sh "echo ${GIT_AUTH_PSW} > tmp_token.txt"
                        sh 'gh auth login --with-token < tmp_token.txt'
                        sh "gh pr comment ${env.CHANGE_BRANCH} --body 'Hi, your environment is ready to use at: https://${TALK_URL}' -R https://github.com/${GITHUB_ORG}/${TALK2_REPO}"
                    }
                } catch (Exception e) {
                    echo 'We could not add the comment in Github PR. Error: ' + e.toString() + '. Please check #dev-deployments channel in Slack for the environment URL.'
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
