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
        API_URL_OVERWRITE = ''
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
                        sh "rsync -a ${ARTIFACTS_CACHE_FOLDER}/node_modules ${WORKSPACE}/build/dev1/"
                    }

                    // If the directories wers not restored, attempt to restore from the develop branch artifacts
                    if (!fileExists("${WORKSPACE}/build/dev1/node_modules")) {
                        if (fileExists("${DEVELOP_CACHE_FOLDER}/artifacts/node_modules")) {
                            sh "rsync -a ${DEVELOP_CACHE_FOLDER}/artifacts/node_modules ${WORKSPACE}/build/dev1/"
                        }
                    }

                    // If this job has no cache, attempt to restore from the develop branch cache
                    if (!fileExists("{YARN_CACHE_FOLDER}")) {
                        if (fileExists("${DEVELOP_CACHE_FOLDER}/yarn")) {
                            sh "rsync -a ${DEVELOP_CACHE_FOLDER}/yarn ${WORKSPACE}/build/dev1/"
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
                sshagent(credentials: ['jenkins-github-creds']) {
                    echo '==> Clone GitOps Repo'
                    sh("""
                    [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
                    ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
                    git clone git@github.com:${GITHUB_ORG}/${TERRAFORM_REPO}.git
                """)
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

                        stage ('[PR/Dev1] Setup Env') {
                            steps {
                                script {
                                  sh '''
                                  mkdir -p ${WORKSPACE}/build/dev1
                                  cp -r $WORKSPACE/* $WORKSPACE/build/dev1/
                                  rm -rf $WORKSPACE/build/dev1/build     
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
                                            cat shared.env dev1.env | awk -F= '!seen[$1]++' > .env.temp 
                                            cat .env.temp pr.env | awk -F= '!seen[$1]++' > .env
                                            rm .env.temp shared.env dev1.env pr.env
                                            '''
                                        } else {
                                            sh '''
                                            cat shared.env dev1.env | awk -F= '!seen[$1]++' > .env
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
                                        cat shared.env dev2.env | awk -F= '!seen[$1]++' > .env.dev2
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
                        stage('[Staging] Setup Env File') {
                            when { branch 'develop' }
                            steps {
                                script {
                                    dir("${WORKSPACE}/build/staging") {
                                        def sharedEnvVars = sh(script: """
                                            aws ssm get-parameters-by-path \\
                                            --path "/shared/talk2/app/" \\
                                            --recursive \\
                                            --with-decryption \\
                                            --profile "dev" \\
                                            --query "Parameters[].{Name:Name,Value:Value}" \\
                                            --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                        """, returnStdout: true).trim()

                                        def stagingEnvVars = sh(script: """
                                            aws ssm get-parameters-by-path \\
                                            --path "/staging/talk2/app/" \\
                                            --recursive \\
                                            --with-decryption \\
                                            --profile "dev" \\
                                            --query "Parameters[].{Name:Name,Value:Value}" \\
                                            --output json | jq -r '.[] | "\\(.Name | sub(".*/"; ""))=\\"\\(.Value)\\""'
                                        """, returnStdout: true).trim()

                                        writeFile file: 'shared.env', text: sharedEnvVars + '\n'
                                        writeFile file: 'staging.env', text: stagingEnvVars + '\n' 

                                        sh '''
                                        cat shared.env staging.env | awk -F= '!seen[$1]++' > .env.staging
                                        rm shared.env staging.env
                                        '''
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
                        withCredentials([file(credentialsId: 'github-app-private-key', variable: 'GH_APP_PEM_FILE')]) {
                            sh '''
                                header_json='{"alg":"RS256","typ":"JWT"}'
                                header=$(echo -n "${header_json}" | base64 -w 0 | tr '+/' '-_' | tr -d '=' 2>/dev/null)
                                
                                now=$(date +%s 2>/dev/null)
                                exp=$((now + 600))
                                payload_json='{"iat":'${now}',"exp":'${exp}',"iss":"'${GH_APP_ID}'"}'
                                payload=$(echo -n "${payload_json}" | base64 -w 0 | tr '+/' '-_' | tr -d '=' 2>/dev/null)
                                
                                cat "${GH_APP_PEM_FILE}" | awk 'NF {sub(/\r/, ""); printf "%s\\n", $0}' > clean.pem 2>/dev/null
                
                                signature=$(echo -n "${header}.${payload}" | openssl dgst -sha256 -sign "${GH_APP_PEM_FILE}" 2>/dev/null | base64 -w 0 | tr '+/' '-_' | tr -d '=' 2>/dev/null)
                                
                                GITHUB_JWT="${header}.${payload}.${signature}"
                                
                                TOKEN=$(curl -s -X POST -H "Authorization: Bearer ${GITHUB_JWT}" \
                                    -H "Accept: application/vnd.github+json" \
                                    "https://api.github.com/app/installations/${GH_INSTALLATION_ID}/access_tokens" | jq -r .token 2>/dev/null)
        
                                PR_ID=$(echo ${GIT_BRANCH} | grep -o 'PR-[0-9]*' | grep -o '[0-9]*' 2>/dev/null)
                                
                                curl -s -X POST \
                                    -H "Authorization: Bearer ${TOKEN}" \
                                    -H "Accept: application/vnd.github.v3+json" \
                                    -d '{"body": "Hi, your environment is ready to use at: https://'${TALK_URL}'"}' \
                                    "https://api.github.com/repos/aloware/aloware-talk2/issues/${PR_ID}/comments" > /dev/null

                                rm -f clean.pem
                            '''
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