pipeline {
    agent any

    environment {
            REACT_APP_VERSION = "1.0.$BUILD_ID"
            AWS_DEFAULT_REGION = "us-east-1"
            AWS_ECR_REPO = "530789571735.dkr.ecr.us-east-1.amazonaws.com"
            APP_NAME = "ljs"
            AWS_ECS_TD = "ljs-project2-td"
            AWS_ECS_CLUSTER = "ljs-project2-cluster"
            AWS_ECS_SERVICE = "ljst-project2-svc"
            AWS_ALBTG = ""

    }

    stages {



        stage ('SonarQube Analysis'){
            environment{
                SONAR_SCANNER_HOME = '/opt/sonar-scanner' //GLOBAL TOOL CONFIG
            }
            steps {
                withSonarQubeEnv('Sonar'){
                    sh'''
                        echo "Injected SonarQube URL: $SONAR_HOST_URL"

                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=jenkins-scan \
                        -Dsonar.projectName=jenkins-scan \
                        -Dsonar.projectVersion=1.0 \
                        -Dsonar.sources=. 

                        echo "Code scanning complete. Check SonarQube for analysis"
                    '''
                }
            }
        }

        stage ('Build Docker Image & Push to ECR') {
            agent {
                docker{
                    image 'aws-cli'
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=''"
                    reuseNode true
                }
            }
            environment{
                AWS_S3_BUCKET = '20250225-dal'
            }
            steps {
                withCredentials([usernamePassword
                (credentialsId: 'aws', passwordVariable: 'AWS_SECRET_ACCESS_KEY',
                 usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    sh '''
                    aws sts get-caller-identity
                    aws ecr describe-repositories
                    docker --version

                    aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin 530789571735.dkr.ecr.us-east-1.amazonaws.com
                    echo $AWS_ECR_REPO

                    echo "REACT_APP_VERSION=1.0$BUILD_ID" > .env

                    echo "LS project2"
                    ls -la project2

                    docker build -t $AWS_ECR_REPO/$APP_NAME-frontend:$REACT_APP_VERSION -f project2/Dockerfile project2/tax-tracker-frontend
                    docker push $AWS_ECR_REPO/$APP_NAME-frontend:$REACT_APP_VERSION

                    #BUILD BACKEND IMAGE & PUSH

                    docker build -t $AWS_ECR_REPO/$APP_NAME-backend:$REACT_APP_VERSION -f project2/tax-tracker/Dockerfile project2/tax-tracker
                    docker push $AWS_ECR_REPO/$APP_NAME-backend:$REACT_APP_VERSION

                    '''
}
            }
        }
        stage ('Deploy to AWS'){
            agent{
                docker{
                    image 'aws-cli'
                    args '--entrypoint=""'
                    reuseNode true
                }
            }
            steps {
                withCredentials([usernamePassword
                (credentialsId: 'aws', passwordVariable: 'AWS_SECRET_ACCESS_KEY',
                 usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    sh '''
                    aws --version

                    # Swap version in ECS task definition
                    sed -i "s/#APP_VERSION#/$REACT_APP_VERSION/g" aws/task-definition.json
                    echo "Sending revised Task Definition to ECS"

                    echo "task-definition.json values"
                    cat aws/task-definition.json

                    # Register new task definition
                    LATEST_TD=$(
                    aws ecs register-task-definition --cli-input-json file://aws/task-definition.json |
                    jq '.taskDefinition.revision'
                    )

                    echo "Latest Task Definition Revision... $LATEST_TD"

                    # Update ECS service
                    aws ecs update-service --cluster $AWS_ECS_CLUSTER --service $AWS_ECS_SERVICE --task-definition $AWS_ECS_TD:$LATEST_TD
                    '''
                 }
            }
        }
    }
    post{
        always{
            echo "Docker scout logs"
            archiveArtifacts artifacts: 'docker-scout-log/*.log' fingerprint: true
        }
    }
}