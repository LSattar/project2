pipeline {
    agent any
    environment {
            REACT_APP_VERSION = "1.0.$BUILD_ID"
            AWS_DEFAULT_REGION = "us-east-1"
            AWS_ECR_REPO = "530789571735.dkr.ecr.us-east-1.amazonaws.com"
            APP_NAME = "ljs"
            AWS_ECS_TD = "ljs-project2-td"
            AWS_ECS_CLUSTER = "ljs-project2-cluster"
            AWS_ECS_SERVICE = "ljs-project2-svc"
            AWS_ALB = "ljs-project2-alb"
            AWS_TG = "ljs-project2-tg"
            AWS_SECURITY_GROUP="ljs-project2-securitygroup"

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
        stage('Build & Push Docker Images') {
            agent {
                docker {
                    image 'aws-cli'
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=''"
                    reuseNode true
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
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
                    '''
                }
            }
        }

        stage('Provision AWS Infrastructure') {
            agent {
                docker {
                    image 'aws-cli'
                    args '--entrypoint=""'
                    reuseNode true
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        echo "Looking up default VPC..."
                        VPC_ID=$(aws ec2 describe-vpcs \
                          --filters Name=isDefault,Values=true \
                          --query 'Vpcs[0].VpcId' \
                          --region "$AWS_DEFAULT_REGION" \
                          --output text)

                        if [[ "$VPC_ID" == "None" || -z "$VPC_ID" ]]; then
                          echo "No default VPC found in region $AWS_DEFAULT_REGION."
                          exit 1
                        fi

                        echo "Getting security group..."
                        SG_ID=$(aws ec2 describe-security-groups \
                          --filters Name=group-name,Values="$AWS_SECURITY_GROUP" \
                          --query 'SecurityGroups[0].GroupId' \
                          --region "$AWS_DEFAULT_REGION" \
                          --output text)

                        echo "Getting subnet IDs..."
                        SUBNET_IDS=$(aws ec2 describe-subnets \
                          --filters Name=vpc-id,Values="$VPC_ID" \
                          --query 'Subnets[*].SubnetId' \
                          --region "$AWS_DEFAULT_REGION" \
                          --output text)
                        SUBNET_JSON=$(printf '"%s",' $SUBNET_IDS | sed 's/,$//')
                        echo "subnets=[$SUBNET_JSON]"

                        NETWORK_CONFIG="awsvpcConfiguration={subnets=[$SUBNET_JSON],securityGroups=[\"$SG_ID\"],assignPublicIp=\"ENABLED\"}"
                        echo "$NETWORK_CONFIG" > aws/network-config.txt

                        echo "Creating ECS Cluster (if not exists)..."
                        aws ecs create-cluster \
                          --cluster-name "$AWS_ECS_CLUSTER" \
                          --region "$AWS_DEFAULT_REGION" \
                          --settings name=containerInsights,value=enabled \
                          --tags key="Name",value="$APP_NAME" || true

                        echo "Creating Load Balancer (if not exists)..."
                        ALB_ARN=$(aws elbv2 create-load-balancer \
                          --name "$AWS_ALB" \
                          --subnets $SUBNET_IDS \
                          --security-groups "$SG_ID" \
                          --scheme internet-facing \
                          --type application \
                          --region "$AWS_DEFAULT_REGION" \
                          --query 'LoadBalancers[0].LoadBalancerArn' \
                          --output text || true)
                        echo "$ALB_ARN" > aws/alb-arn.txt

                        echo "Creating Target Group..."
                        TG_ARN=$(aws elbv2 create-target-group \
                          --name "$AWS_TG" \
                          --protocol HTTP \
                          --port 80 \
                          --target-type ip \
                          --vpc-id "$VPC_ID" \
                          --region "$AWS_DEFAULT_REGION" \
                          --query 'TargetGroups[0].TargetGroupArn' \
                          --output text || true)
                        echo "$TG_ARN" > aws/tg-arn.txt

                        echo "Creating Listener..."
                        aws elbv2 create-listener \
                          --load-balancer-arn "$ALB_ARN" \
                          --protocol HTTP \
                          --port 80 \
                          --default-actions Type=forward,TargetGroupArn="$TG_ARN" \
                          --region "$AWS_DEFAULT_REGION" || true
                    '''
                }
            }
        }

        stage('Register ECS Task Definition') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        TMP_DEF="aws/task-definition-temp.json"
                        cp aws/task-definition.json "$TMP_DEF"
                        sed -i.bak "s|#APP_VERSION#|$REACT_APP_VERSION|g" "$TMP_DEF"

                        echo "Registering Task Definition..."
                        aws ecs register-task-definition \
                          --cli-input-json file://"$TMP_DEF" \
                          --region "$AWS_DEFAULT_REGION"

                        rm "$TMP_DEF" "$TMP_DEF.bak"
                    '''
                }
            }
        }

        stage('Deploy ECS Service') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        TG_ARN=$(cat aws/tg-arn.txt)
                        NETWORK_CONFIG=$(cat aws/network-config.txt)

                        echo "Checking if ECS service exists..."
                        SERVICE_EXISTS=$(aws ecs describe-services \
                          --cluster "$AWS_ECS_CLUSTER" \
                          --services "$AWS_ECS_SERVICE" \
                          --region "$AWS_DEFAULT_REGION" \
                          --query 'services[0].status' \
                          --output text 2>/dev/null || echo "NOT_FOUND")

                        if [[ "$SERVICE_EXISTS" == "ACTIVE" || "$SERVICE_EXISTS" == "DRAINING" ]]; then
                          echo "Updating existing ECS service..."
                          aws ecs update-service \
                            --cluster "$AWS_ECS_CLUSTER" \
                            --service "$AWS_ECS_SERVICE" \
                            --task-definition "$AWS_ECS_TD" \
                            --force-new-deployment \
                            --region "$AWS_DEFAULT_REGION"
                        else
                          echo "Creating ECS service..."
                          aws ecs create-service \
                            --cluster "$AWS_ECS_CLUSTER" \
                            --service-name "$AWS_ECS_SERVICE" \
                            --task-definition "$AWS_ECS_TD" \
                            --desired-count 1 \
                            --launch-type FARGATE \
                            --network-configuration "$NETWORK_CONFIG" \
                            --load-balancers targetGroupArn=$TG_ARN,containerName=ljs-frontend,containerPort=3000 \
                            --region "$AWS_DEFAULT_REGION" \
                            --tags key="Name",value="$APP_NAME"
                        fi
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