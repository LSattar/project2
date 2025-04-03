#!/bin/bash
# Usage: AWS_PROFILE=<your-profile> ./aws.sh

exec > >(tee results.txt) 2>&1

# Prompt for configuration
read -p "Enter AWS region [default: us-east-1]: " REGION
REGION=${REGION:-us-east-1}

read -p "Enter ECS Cluster Name [default: ljs-project2-cluster]: " CLUSTER_NAME
CLUSTER_NAME=${CLUSTER_NAME:-ljs-project2-cluster}

read -p "Enter Task Definition Family Name [default: ljs-project2-td]: " TASK_DEF_NAME
TASK_DEF_NAME=${TASK_DEF_NAME:-ljs-project2-td}

read -p "Enter ECS Service Name [default: ljs-project2-svc]: " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-ljs-project2-svc}

read -p "Enter Container Name [default: ljs]: " APP_NAME
APP_NAME=${APP_NAME:-ljs}

IMAGE_TAG="latest"
echo "Using default Docker image tag: $IMAGE_TAG"

read -p "Enter ALB Name [default: ljs-project2-alb]: " ALB_NAME
ALB_NAME=${ALB_NAME:-ljs-project2-alb}

read -p "Enter Target Group Name [default: ljs-project2-tg]: " TG_NAME
TG_NAME=${TG_NAME:-ljs-project2-tg}

read -p "Enter Security Group Name [default: ljs-project2-securitygroup]: " SECURITY_GROUP_NAME
SECURITY_GROUP_NAME=${SECURITY_GROUP_NAME:-ljs-project2-securitygroup}

ECR_REPO="530789571735.dkr.ecr.$REGION.amazonaws.com"

echo "Looking up default VPC in region $REGION..."
VPC_ID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' \
  --region "$REGION" \
  --output text)

if [[ "$VPC_ID" == "None" || -z "$VPC_ID" ]]; then
  echo "No default VPC found in region $REGION."
  exit 1
fi

echo "Using default VPC: $VPC_ID"

SUBNET_IDS=$(aws ec2 describe-subnets \
  --filters Name=vpc-id,Values="$VPC_ID" \
  --query 'Subnets[*].SubnetId' \
  --region "$REGION" \
  --output text)

#Get Security Group ID
SG_ID=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values="$SECURITY_GROUP_NAME" \
  --query 'SecurityGroups[0].GroupId' \
  --region "$REGION" \
  --output text)

if [[ "$SG_ID" == "None" || -z "$SG_ID" ]]; then
  echo "Security group '$SECURITY_GROUP_NAME' not found."
  exit 1
fi

SUBNET_CSV=$(echo "$SUBNET_IDS" | tr '\t' ',')
SUBNET_ARRAY=$(echo "$SUBNET_CSV" | sed 's/,/","/g')
SUBNET_ARRAY="\"$SUBNET_ARRAY\""


#Create ECS Cluster
echo "Creating ECS cluster: $CLUSTER_NAME"
aws ecs create-cluster \
  --cluster-name "$CLUSTER_NAME" \
  --region "$REGION" \
  --tags key="Name",value="$APP_NAME"

#Create ALB
echo "Creating Load Balancer: $ALB_NAME"
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name "$ALB_NAME" \
  --subnets $SUBNET_IDS \
  --security-groups "$SG_ID" \
  --scheme internet-facing \
  --type application \
  --region "$REGION" \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

#Create Target Group
echo "Creating Target Group: $TG_NAME"
TG_ARN=$(aws elbv2 create-target-group \
  --name "$TG_NAME" \
  --protocol HTTP \
  --port 80 \
  --target-type ip \
  --vpc-id "$VPC_ID" \
  --region "$REGION" \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text )

#Create Listener
echo "Creating Listener for Load Balancer"
aws elbv2 create-listener \
  --load-balancer-arn "$ALB_ARN" \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn="$TG_ARN" \
  --region "$REGION" 

# Inject image tag into task definition and register
echo "Registering Task Definition: $TASK_DEF_NAME"

aws ecs register-task-definition \
  --cli-input-json file://aws/task-definition.json \
  --region "$REGION"


# Create ECS Service
echo "Creating ECS Service: $SERVICE_NAME"
aws ecs create-service \
  --cluster "$CLUSTER_NAME" \
  --service-name "$SERVICE_NAME" \
  --task-definition "$TASK_DEF_NAME" \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_ARRAY],securityGroups=[\"$SG_ID\"],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=$TG_ARN,containerName=ljs-frontend,containerPort=3000 \
  --region "$REGION" \
  --tags key="Name",value="$APP_NAME"

echo "Deployment complete. Service '$SERVICE_NAME' is now running in ECS cluster '$CLUSTER_NAME'."
