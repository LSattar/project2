pipeline {
    agent any

    environment {
            REACT_APP_VERSION = "1.0.$BUILD_ID"
            AWS_DEFAULT_REGION = "us-east-1"
            AWS_ECR_REPO = "530789571735.dkr.ecr.us-east-1.amazonaws.com"
            APP_NAME = "ljs"
            AWS_ECS_TD = "ljs-project2-td"
    }

    stages {
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

                    echo "REACT_APP_VERSION=1.0$BUILD_ID > .env

                    docker build -t $AWS_ECR_REPO/$APP_NAME-frontend:$REACT_APP_VERSION . 
                    docker push $AWS_ECR_REPO/$APP_NAME-frontend:$REACT_APP_VERSION

                    #BUILD BACKEND IMAGE & PUSH

                    docker build -t $AWS_ECR_REPO/$APP_NAME-backend:$VITE_APP_VERSION -f 'Project 2/Backend
                    Dockerfile' tax-tracker
                    docker push$AWS_ECR_REPO/$APP_NAME-backend:$VITE_APP_VERSION

                    '''
}
            }
        }
    }
}