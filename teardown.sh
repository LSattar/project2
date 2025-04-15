#!/bin/bash
# Usage: AWS_PROFILE=<your-profile> ./teardown.sh

# Prompt for values
read -p "Enter AWS region [default: us-east-1]: " REGION
REGION=${REGION:-us-east-1}

read -p "Enter ECS Cluster Name [default: ljs-project2-cluster]: " CLUSTER_NAME
CLUSTER_NAME=${CLUSTER_NAME:-ljs-project2-cluster}

read -p "Enter Task Definition Family Name [default: ljs-project2-td]: " TASK_DEF_NAME
TASK_DEF_NAME=${TASK_DEF_NAME:-ljs-project2-td}

read -p "Enter ECS Service Name [default: ljs-project2-svc]: " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-ljs-project2-svc}

read -p "Enter ALB Name [default: ljs-project2-alb]: " ALB_NAME
ALB_NAME=${ALB_NAME:-ljs-project2-alb}

read -p "Enter Target Group Name [default: ljs-project2-tg]: " TG_NAME
TG_NAME=${TG_NAME:-ljs-project2-tg}

set -e

# Delete ECS Service
echo "Deleting ECS service: $SERVICE_NAME"
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --desired-count 0 \
  --region "$REGION"

aws ecs delete-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --force \
  --region "$REGION"

echo "Waiting for ECS service to be inactive..."
aws ecs wait services-inactive \
  --cluster "$CLUSTER_NAME" \
  --services "$SERVICE_NAME" \
  --region "$REGION"

# Deregister task definitions
echo "Deregistering task definitions for family: $TASK_DEF_NAME"
TASK_ARNS=$(aws ecs list-task-definitions \
  --family-prefix "$TASK_DEF_NAME" \
  --region "$REGION" \
  --query 'taskDefinitionArns' \
  --output text)

for TASK_ARN in $TASK_ARNS; do
  echo "Deregistering $TASK_ARN"
  aws ecs deregister-task-definition --task-definition "$TASK_ARN" --region "$REGION"
done

# Get Load Balancer ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names "$ALB_NAME" \
  --region "$REGION" \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Delete Listener
echo "Deleting Listener from Load Balancer"
LISTENER_ARN=$(aws elbv2 describe-listeners \
  --load-balancer-arn "$ALB_ARN" \
  --region "$REGION" \
  --query 'Listeners[0].ListenerArn' \
  --output text)

aws elbv2 delete-listener \
  --listener-arn "$LISTENER_ARN" \
  --region "$REGION"

# Delete Load Balancer
echo "Deleting Load Balancer: $ALB_NAME"
aws elbv2 delete-load-balancer \
  --load-balancer-arn "$ALB_ARN" \
  --region "$REGION"

echo "Waiting for Load Balancer to be deleted..."
aws elbv2 wait load-balancers-deleted \
  --load-balancer-arns "$ALB_ARN" \
  --region "$REGION"

# Delete Target Group
echo "Deleting Target Group: $TG_NAME"
TG_ARN=$(aws elbv2 describe-target-groups \
  --names "$TG_NAME" \
  --region "$REGION" \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

aws elbv2 delete-target-group \
  --target-group-arn "$TG_ARN" \
  --region "$REGION"

sleep 15

# Delete ECS Cluster
echo "Deleting ECS Cluster: $CLUSTER_NAME"
aws ecs delete-cluster \
  --cluster "$CLUSTER_NAME" \
  --region "$REGION"

echo "Teardown complete."