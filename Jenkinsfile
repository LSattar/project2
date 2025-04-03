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
        stage ('Build Docker Image & Push to ECR') {
            agent {
                docker{
                    image 'aws-cli'
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=''"
                    reuseNode true
                }
            }
            steps {
                withCredentials([usernamePassword
                (credentialsId: 'aws', passwordVariable: 'AWS_SECRET_ACCESS_KEY',
                 usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    sh '''
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

                    echo "Using default VPC: $VPC_ID"

                    SUBNET_IDS=$(aws ec2 describe-subnets \
                    --filters Name=vpc-id,Values="$VPC_ID" \
                    --query 'Subnets[*].SubnetId' \
                    --region "$AWS_DEFAULT_REGION" \
                    --output text)

                    SUBNET_JSON=$(printf '"%s",' $SUBNET_IDS | sed 's/,$//')
                    NETWORK_CONFIG="awsvpcConfiguration={subnets=[$SUBNET_JSON],securityGroups=[\"$SG_ID\"],assignPublicIp=\"ENABLED\"}"

                    echo "Network config:"
                    echo $NETWORK_CONFIG

                    SG_ID=$(aws ec2 describe-security-groups \
                    --filters Name=group-name,Values="$AWS_SECURITY_GROUP" \
                    --query 'SecurityGroups[0].GroupId' \
                    --region "$AWS_DEFAULT_REGION" \
                    --output text)

                    if [[ "$SG_ID" == "None" || -z "$SG_ID" ]]; then
                    echo "Security group '$AWS_SECURITY_GROUP' not found."
                    exit 1
                    fi

                    echo "Ensuring ECS cluster '$AWS_ECS_CLUSTER' exists..."
                    aws ecs create-cluster \
                    --cluster-name "$AWS_ECS_CLUSTER" \
                    --region "$AWS_DEFAULT_REGION" \
                    --settings name=containerInsights,value=enabled \
                    --tags key="Name",value="$APP_NAME" || true

                    echo "Creating Load Balancer: $AWS_ALB"
                    ALB_ARN=$(aws elbv2 create-load-balancer \
                    --name "$AWS_ALB" \
                    --subnets $SUBNET_IDS \
                    --security-groups "$SG_ID" \
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
                    --vpc-id "$VPC_ID" \
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
                    --load-balancers targetGroupArn=$TG_ARN,containerName=ljs-frontend,containerPort=3000 \
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