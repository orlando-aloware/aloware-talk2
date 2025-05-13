@Library('jenkins-shared-libraries')_
pipeline {
    agent any

    options {
        disableConcurrentBuilds(abortPrevious: true)
    }

    environment {
        DEV_DOMAIN = 'alodev.org'
        STAGING_DOMAIN = 'alostaging.com'
        TERRAFORM_REPO = 'terraform-groundwork'
        TALK2_REPO = 'aloware-talk2'
        GITHUB_ORG = 'aloware'
        GIT_AUTH = credentials('jenkins-github-user')
        CREDS = credentials('aws-credentials-profiles')
        AWS_REGION = 'us-west-2'
        NODE_VERSION = '20'
        SAFE_JOB_NAME = "${env.JOB_NAME.replaceAll('/', '-').toLowerCase()}"
        CACHE_FOLDER = "${HOME}/.jenkins-cache/${SAFE_JOB_NAME}"
        YARN_CACHE_FOLDER = "${CACHE_FOLDER}/yarn"
        ARTIFACTS_CACHE_FOLDER = "${CACHE_FOLDER}/artifacts"
        DEVELOP_SAFE_JOB_NAME = "${JOB_NAME.split('/')[0]}-develop"
        DEVELOP_CACHE_FOLDER = "${HOME}/.jenkins-cache/${DEVELOP_SAFE_JOB_NAME}"
        TALK_URL = "${env.GIT_BRANCH.toLowerCase().contains('pr') ? "${env.GIT_BRANCH.toLowerCase()}.talk" : 'talk'}.${DEV_DOMAIN}"
        TALK2_URL = "talk2.${DEV_DOMAIN}"
        STAGING_URL = "talk.${STAGING_DOMAIN}"
        STAGING_KMS_KEY_ID = "ad590faf-76cb-4e4d-a6f1-f97606417ab4"
        STAGING_CACHE_POLICY_ID="82a16562-447e-4078-89af-77c83f74d9ce"
        DEV_CACHE_POLICY_ID="8276b0a9-835d-41d5-a981-85f98c8f390a"
        // Fill this with the URL of the MDE instance, for example https://pr-9331.mde.alodev.org to be able to use this Talk PR with MDE.
        // REMOVE BEFORE MERGING TO develop/master
        API_URL_OVERWRITE = 'https://app2.alodev.org/'
        GH_APP_PEM = credentials('github-app-private-key')
        GH_APP_ID = '1157885'
        GH_INSTALLATION_ID = '61798182'
    }

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
                    if (!fileExists("${WORKSPACE}/build/dev1/node_modules")) {
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
                script {
                    echo '==> Clone GitOps Repo'
                    def token = getGitHubAppToken()
                    wrap([$class: 'MaskPasswordsBuildWrapper', varPasswordPairs: [[password: token, var: 'TOKEN']]]) {
                        sh "git clone https://x-access-token:${token}@github.com/${GITHUB_ORG}/${TERRAFORM_REPO}.git"
                    }
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

        stage('Build and Analysis') {
            parallel {
                stage('Build dev1') {
                    stages {

                        stage ('[PR/Dev1] Setup workspace') {
                            when { not { branch 'master' } }
                            steps {
                                script {
                                  sh '''
                                  mkdir -p ${WORKSPACE}/build/dev1
                                  find $WORKSPACE -mindepth 1 -maxdepth 1 ! -name 'build' -exec cp -r {} $WORKSPACE/build/dev1/ \\;
                                  '''
                                }
                            }
                        }

                        stage('[PR/Dev1] Setup Env File') {
                            when { not { branch 'master' } }
                            steps {
                                script {
                                    dir("${WORKSPACE}/build/dev1") {
                                        def sharedEnvVars = sh(script: """
                                            aws ssm get-parameters-by-path \\
                                            --path "/shared/talk2/app/" \\
                                            --recursive \\
                                            --with-decryption \\
                                            --profile "dev" \\
                                            --query "Parameters[].{Name:Name,Value:Value}" \\
                                            --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                        """, returnStdout: true).trim()

                                        def dev1EnvVars = sh(script: """
                                            aws ssm get-parameters-by-path \\
                                            --path "/dev1/talk2/app/" \\
                                            --recursive \\
                                            --with-decryption \\
                                            --profile "dev" \\
                                            --query "Parameters[].{Name:Name,Value:Value}" \\
                                            --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                        """, returnStdout: true).trim()

                                        def prEnvVars = ""
                                        if (env.GIT_BRANCH.toLowerCase().contains('pr-')) {
                                            def prId = env.GIT_BRANCH.toLowerCase().replaceAll('.*pr-([0-9]+).*', '$1')
                                            echo "Looking for environment variables for PR-${prId}"
                                            try {
                                                prEnvVars = sh(script: """
                                                    aws ssm get-parameters-by-path \\
                                                    --path "/pr-${prId}/talk2/app/" \\
                                                    --recursive \\
                                                    --with-decryption \\
                                                    --profile "dev" \\
                                                    --query "Parameters[].{Name:Name,Value:Value}" \\
                                                    --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                                """, returnStdout: true).trim()
                                            } catch (Exception e) {
                                                echo "No specific variables found for PR-${prId}: ${e.message}"
                                                prEnvVars = ""
                                            }
                                        }

                                        writeFile file: 'shared.env', text: sharedEnvVars + '\n'
                                        writeFile file: 'dev1.env', text: dev1EnvVars + '\n'

                                        if (prEnvVars) {
                                            writeFile file: 'pr.env', text: prEnvVars + '\n'
                                            sh '''
                                            cat pr.env dev1.env shared.env | awk -F= '{if (!seen[$1]++) print}' > .env
                                            rm shared.env dev1.env pr.env
                                            '''
                                        } else {
                                            sh '''
                                            cat dev1.env shared.env | awk -F= '!seen[$1]++' > .env
                                            rm shared.env dev1.env
                                            '''
                                        }

                                        if (env.API_URL_OVERWRITE) {
                                            sh "sed -i 's|API_URL=.*|API_URL=${env.API_URL_OVERWRITE}|' .env"
                                            sh "sed -i 's|API_REPORTING_URL=.*|API_REPORTING_URL=${env.API_URL_OVERWRITE}|' .env"
                                        }

                                        sh '''
                                        cp .env .env.prod
                                        '''
                                    }
                                }
                            }
                        }

                        stage('[PR/Dev1] Build Assets') {
                            when { not { branch 'master' } }
                            steps {
                                dir("${WORKSPACE}/build/dev1") {
                                    nvm("${NODE_VERSION}") {
                                        sh 'NODE_ENV=dev1 quasar build --debug'
                                    }
                                }
                            }
                        }

                        stage('[PR/Dev1] Deploy Talk2') {
                            when { not { branch 'master' } }
                            steps {
                                script {
                                    def branchName = env.GIT_BRANCH.toLowerCase()
                                    def subDomain = branchName.contains('pr') ? "${branchName}.talk" : 'talk'

                                    dir("${WORKSPACE}/build/dev1") {
                                        sh '''
                                        mkdir -p terraform
                                        cp -r ${WORKSPACE}/${TERRAFORM_REPO}/s3_cloudfront terraform/
                                        '''

                                        dir("terraform/s3_cloudfront") {
                                            sh '''
                                            terraform init -backend-config="profile=dev"; \
                                            terraform validate; \
                                            terraform fmt
                                            '''

                                            try {
                                                sh "terraform workspace new ${branchName}"
                                            } catch (Exception e) {
                                                echo 'The workspace already exists, running TF Commands...'
                                                sh "terraform workspace select ${branchName}"
                                            }

                                            sh "AWS_PROFILE=dev terraform apply -var environment='develop' -var domainName='${TALK_URL}' -var route53_zone='${DEV_DOMAIN}' -var cachePolicyId='${DEV_CACHE_POLICY_ID}' --auto-approve"
                                        }

                                        sh "AWS_PROFILE=dev ENV=dev1 yarn upload-s3"
                                    }
                                }
                            }
                        }

                        stage('Save Cache (node_modules)') {
                            steps {
                                dir("${WORKSPACE}/build/dev1") {
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
                        }
                    }
                }

                stage('Build dev2') {
                   stages {

                        stage ('[Dev2] Setup workspace') {
                            when { branch 'develop' }
                            steps {
                                script {
                                  sh '''
                                  mkdir -p ${WORKSPACE}/build/dev2
                                  find $WORKSPACE -mindepth 1 -maxdepth 1 ! -name 'build' -exec cp -r {} $WORKSPACE/build/dev2/ \\;
                                  '''
                                }
                            }
                        }

                        stage('[Dev2] Setup Env File') {
                            when { branch 'develop' }
                            steps {
                                script {
                                    dir("${WORKSPACE}/build/dev2") {
                                        def sharedEnvVars = sh(script: """
                                            aws ssm get-parameters-by-path \\
                                            --path "/shared/talk2/app/" \\
                                            --recursive \\
                                            --with-decryption \\
                                            --profile "dev" \\
                                            --query "Parameters[].{Name:Name,Value:Value}" \\
                                            --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                        """, returnStdout: true).trim()

                                        def dev2EnvVars = sh(script: """
                                            aws ssm get-parameters-by-path \\
                                            --path "/dev2/talk2/app/" \\
                                            --recursive \\
                                            --with-decryption \\
                                            --profile "dev" \\
                                            --query "Parameters[].{Name:Name,Value:Value}" \\
                                            --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                        """, returnStdout: true).trim()

                                        writeFile file: 'shared.env', text: sharedEnvVars + '\n'
                                        writeFile file: 'dev2.env', text: dev2EnvVars + '\n'

                                        sh '''
                                        cat dev2.env shared.env | awk -F= '!seen[$1]++' > .env
                                        cp .env .env.prod
                                        rm shared.env dev2.env
                                        '''
                                    }
                                }
                            }
                        }

                        stage('[Dev2] Build Assets') {
                            when { branch 'develop' }
                            steps {
                                dir("${WORKSPACE}/build/dev2") {
                                    nvm("${NODE_VERSION}") {
                                        sh 'NODE_ENV=dev2 quasar build --debug'
                                    }
                                }
                            }
                        }

                        stage('[Dev2] Deploy Talk2') {
                            when { branch 'develop' }
                            steps {
                                script {
                                    def workspaceName = 'talk2'
                                    def subDomain = 'talk2'

                                    dir("${WORKSPACE}/build/dev2") {
                                        sh '''
                                        mkdir -p terraform
                                        cp -r ${WORKSPACE}/${TERRAFORM_REPO}/s3_cloudfront terraform/
                                        '''

                                        dir("terraform/s3_cloudfront") {
                                            sh '''
                                            terraform init -backend-config="profile=dev"; \
                                            terraform validate; \
                                            terraform fmt
                                            '''

                                            try {
                                                sh "terraform workspace new ${workspaceName}"
                                            } catch (Exception e) {
                                                echo 'The workspace already exists, running TF Commands...'
                                                sh "terraform workspace select ${workspaceName}"
                                            }

                                            sh "AWS_PROFILE=dev terraform apply -var environment='develop' -var domainName='${TALK2_URL}' -var route53_zone='${DEV_DOMAIN}' -var cachePolicyId='${DEV_CACHE_POLICY_ID}' --auto-approve"
                                        }

                                        sh "AWS_PROFILE=dev ENV=dev2 yarn upload-s3"
                                    }
                                }
                            }
                        }
                   }
                }

                stage('Build staging') {
                    stages {

                        stage ('[Staging] Setup workspace') {
                            when { branch 'develop' }
                            steps {
                                script {
                                  sh '''
                                  mkdir -p ${WORKSPACE}/build/staging
                                  find $WORKSPACE -mindepth 1 -maxdepth 1 ! -name 'build' -exec cp -r {} $WORKSPACE/build/staging/ \\;
                                  '''
                                }
                            }
                        }

                        stage('[Staging] Setup Env File') {
                           when { branch 'develop' }
                            steps {
                                script {
                                    dir("${WORKSPACE}/build/staging") {

                                        def stagingEnvVars = sh(script: """
                                            aws ssm get-parameters-by-path \\
                                            --path "/staging/talk2/app/" \\
                                            --recursive \\
                                            --with-decryption \\
                                            --profile "staging" \\
                                            --query "Parameters[].{Name:Name,Value:Value}" \\
                                            --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                        """, returnStdout: true).trim()

                                        writeFile file: '.env', text: stagingEnvVars + '\n'
                                        writeFile file: '.env.prod', text: stagingEnvVars + '\n'

                                    }
                                }
                            }
                        }

                        stage('[Staging] Build Assets') {
                            when { branch 'develop' }
                            steps {
                                dir("${WORKSPACE}/build/staging") {
                                    nvm("${NODE_VERSION}") {
                                        sh 'NODE_ENV=staging quasar build --debug'
                                    }
                                }
                            }
                        }

                        stage('[Staging] Deploy Talk2') {
                            when { branch 'develop' }
                            steps {
                                script {
                                    def workspaceName = 'talk2'
                                    def subDomain = 'talk2'

                                    dir("${WORKSPACE}/build/staging") {
                                        sh '''
                                        mkdir -p terraform
                                        cp -r ${WORKSPACE}/${TERRAFORM_REPO}/s3_cloudfront terraform/
                                        '''

                                        dir("terraform/s3_cloudfront") {
                                            sh """
                                            terraform init \\
                                                -backend-config="bucket=aloware-terraform-tfstate-staging" \\
                                                -backend-config="key=s3_cloudfront/terraform.tfstate" \\
                                                -backend-config="region=us-west-2" \\
                                                -backend-config="dynamodb_table=terraform-state" \\
                                                -backend-config="kms_key_id=${STAGING_KMS_KEY_ID}" \\
                                                -backend-config="profile=staging"
                                            terraform validate
                                            terraform fmt
                                            """

                                            try {
                                                sh "terraform workspace new ${workspaceName}"
                                            } catch (Exception e) {
                                                echo 'The workspace already exists, running TF Commands...'
                                                sh "terraform workspace select ${workspaceName}"
                                            }

                                            sh "AWS_PROFILE=staging terraform apply -var environment='develop' -var domainName='${STAGING_URL}' -var route53_zone='${STAGING_DOMAIN}' -var cachePolicyId='${STAGING_CACHE_POLICY_ID}' --auto-approve"
                                        }

                                        sh "AWS_PROFILE=staging ENV=staging yarn upload-s3"
                                    }
                                }
                            }
                        }
                    }
                }
                stage('Sonar Analysis') {
                    stages {
                        stage('SonarQube') {
                            when {
                                anyOf {
                                    branch 'master';
                                    branch 'develop'
                                }
                            }
                            steps {
                                script {
                                    sh 'git rev-parse --abbrev-ref HEAD'
                                    def scannerHome = tool 'SonarQube Tool';
                                    withSonarQubeEnv('Sonar') {
                                        sh "${scannerHome}/bin/sonar-scanner"
                                    }
                                }
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
                        def token = getGitHubAppToken()
                        def prId = sh(script: "echo ${env.GIT_BRANCH} | grep -o 'PR-[0-9]*' | grep -o '[0-9]*'", returnStdout: true).trim()

                        if (prId) {
                            wrap([$class: 'MaskPasswordsBuildWrapper', varPasswordPairs: [[password: token, var: 'TOKEN']]]) {
                                sh """
                                curl -s -X POST \\
                                    -H "Authorization: Bearer ${token}" \\
                                        -H "Accept: application/vnd.github.v3+json" \\
                                        -d '{"body": "Hi, your environment is ready to use at: https://${TALK_URL}"}' \\
                                        "https://api.github.com/repos/${GITHUB_ORG}/${TALK2_REPO}/issues/${prId}/comments" > /dev/null
                                """
                            }
                        }
                    }
                } catch (Exception e) {
                    echo 'We could not add the comment in GitHub PR. Error: ' + e.toString() + '. Please check #dev-deployments channel in Slack for the environment URL.'
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

def getGitHubAppToken() {
    withCredentials([file(credentialsId: 'github-app-private-key', variable: 'GH_APP_PEM_FILE')]) {
        def rawToken = sh(script: '''
            now=$(date +%s)
            exp=$((now + 600))

            header='{"alg":"RS256","typ":"JWT"}'
            payload='{"iat":'${now}',"exp":'${exp}',"iss":"'${GH_APP_ID}'"}'

            base64_header=$(echo -n "${header}" | base64 -w 0 | tr '+/' '-_' | tr -d '=')
            base64_payload=$(echo -n "${payload}" | base64 -w 0 | tr '+/' '-_' | tr -d '=')

            signature=$(echo -n "${base64_header}.${base64_payload}" | openssl dgst -sha256 -sign "${GH_APP_PEM_FILE}" | base64 -w 0 | tr '+/' '-_' | tr -d '=')

            jwt="${base64_header}.${base64_payload}.${signature}"

            curl -s -X POST \
                -H "Authorization: Bearer ${jwt}" \
                -H "Accept: application/vnd.github+json" \
                "https://api.github.com/app/installations/${GH_INSTALLATION_ID}/access_tokens" | jq -r .token
        ''', returnStdout: true).trim()

        return rawToken
    }
}

