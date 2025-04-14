pipeline {
    agent any
    environment {
        REACT_APP_VERSION = "1.0.${BUILD_ID}"
        AWS_DEFAULT_REGION = "us-east-1"
        AWS_ECR_REPO = "530789571735.dkr.ecr.us-east-1.amazonaws.com"
        APP_NAME = "ljs"
        AWS_ECS_TD = "ljs-project2-td"
        AWS_ECS_CLUSTER = "ljs-project2-cluster"
        AWS_ECS_SERVICE = "ljs-project2-svc"
        AWS_ALB = "ljs-project2-alb"
        AWS_TG = "ljs-project2-tg"
        AWS_VPC_ID = "vpc-0c24715fddff98b6a"
        AWS_ECS_SG_NAME = "ljs-project2-ecs-sg"
        AWS_ALB_SG_NAME = "ljs-project2-alb-sg"
        PRIVATE_SUBNET_1 = "subnet-02de7e60bbbffd7e7"
        PRIVATE_SUBNET_2 = "subnet-0183e1bfeb8053643"
        PUBLIC_SUBNET_1 = "subnet-031148a1843faa546"
        PUBLIC_SUBNET_2 = "subnet-03af6d1841ec8fdae"
    }
    stages {
        stage('Maven Build') {
            environment{
                MAVEN_HOME = tool 'Maven'
            }
            steps {
                dir('project2/tax-tracker') {
                    sh '${MAVEN_HOME}/bin/mvn clean package -DskipTests'
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
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    sh '''
                    
                    set -e

                    aws sts get-caller-identity
                    aws ecr describe-repositories
                    docker --version

                    aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ECR_REPO

                    echo "REACT_APP_VERSION=$REACT_APP_VERSION" > .env

                    docker build --network=host \
                        -t $AWS_ECR_REPO/$APP_NAME-frontend:$REACT_APP_VERSION \
                        -f project2/Dockerfile project2

                    docker push $AWS_ECR_REPO/$APP_NAME-frontend:$REACT_APP_VERSION

                    docker build --network=host \
                        -t $AWS_ECR_REPO/$APP_NAME-backend:$REACT_APP_VERSION \
                        -f project2/tax-tracker/Dockerfile project2/tax-tracker

                    docker push $AWS_ECR_REPO/$APP_NAME-backend:$REACT_APP_VERSION

                    echo "Looking up ECS Security Group..."
                    ECS_SG_ID=$(aws ec2 describe-security-groups \
                        --filters Name=group-name,Values="$AWS_ECS_SG_NAME" \
                        --query 'SecurityGroups[0].GroupId' \
                        --region "$AWS_DEFAULT_REGION" \
                        --output text)

                    echo "Looking up ALB Security Group..."
                    ALB_SG_ID=$(aws ec2 describe-security-groups \
                        --filters Name=group-name,Values="$AWS_ALB_SG_NAME" \
                        --query 'SecurityGroups[0].GroupId' \
                        --region "$AWS_DEFAULT_REGION" \
                        --output text)

                    SUBNET_JSON="\\\"$PRIVATE_SUBNET_1\\\",\\\"$PRIVATE_SUBNET_2\\\""
                    NETWORK_CONFIG="awsvpcConfiguration={subnets=[$SUBNET_JSON],securityGroups=[\\\"$ECS_SG_ID\\\"],assignPublicIp=\\\"ENABLED\\\"}"

                    echo "Network config: $NETWORK_CONFIG"

                    echo "Ensuring ECS cluster '$AWS_ECS_CLUSTER' exists..."
                    aws ecs create-cluster \
                        --cluster-name "$AWS_ECS_CLUSTER" \
                        --region "$AWS_DEFAULT_REGION" \
                        --settings name=containerInsights,value=enabled \
                        --tags key="Name",value="$APP_NAME" || true

                    echo "Creating Load Balancer: $AWS_ALB"
                    ALB_ARN=$(aws elbv2 create-load-balancer \
                        --name "$AWS_ALB" \
                        --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
                        --security-groups "$ALB_SG_ID" \
                        --scheme internet-facing \
                        --type application \
                        --region "$AWS_DEFAULT_REGION" \
                        --query 'LoadBalancers[0].LoadBalancerArn' \
                        --output text)

                    echo "Creating Target Group: $AWS_TG"
                    TG_ARN=$(aws elbv2 create-target-group \
                        --name "$AWS_TG" \
                        --protocol HTTP \
                        --port 80 \
                        --target-type ip \
                        --vpc-id "$AWS_VPC_ID" \
                        --region "$AWS_DEFAULT_REGION" \
                        --query 'TargetGroups[0].TargetGroupArn' \
                        --output text)

                    echo "Creating Listener for Load Balancer"
                    aws elbv2 create-listener \
                        --load-balancer-arn "$ALB_ARN" \
                        --protocol HTTP \
                        --port 80 \
                        --default-actions Type=forward,TargetGroupArn="$TG_ARN" \
                        --region "$AWS_DEFAULT_REGION"

                    echo "Registering Task Definition: $AWS_ECS_TD"
                    TMP_DEF="aws/task-definition-temp.json"
                    cp aws/task-definition.json "$TMP_DEF"
                    sed -i.bak "s|#APP_VERSION#|$REACT_APP_VERSION|g" "$TMP_DEF"

                    aws ecs register-task-definition \
                        --cli-input-json file://"$TMP_DEF" \
                        --region "$AWS_DEFAULT_REGION"

                    rm "$TMP_DEF" "$TMP_DEF.bak"

                    echo "Creating ECS Service: $AWS_ECS_SERVICE"
                    aws ecs create-service \
                        --cluster "$AWS_ECS_CLUSTER" \
                        --service-name "$AWS_ECS_SERVICE" \
                        --task-definition "$AWS_ECS_TD" \
                        --desired-count 1 \
                        --launch-type FARGATE \
                        --network-configuration "$NETWORK_CONFIG" \
                        --load-balancers targetGroupArn=$TG_ARN,containerName=ljs-frontend,containerPort=80 \
                        --region "$AWS_DEFAULT_REGION" \
                        --tags key="Name",value="$APP_NAME"

                    echo "Deployment complete. Service '$AWS_ECS_SERVICE' is now running in ECS cluster '$AWS_ECS_CLUSTER'."
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
}