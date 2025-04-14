#!/bin/bash

REGION="us-east-1"
VPC_ID="vpc-0c24715fddff98b6a"
SECURITY_GROUP_ID="sg-0139859f8a70416a8" 
SUBNET_IDS=("subnet-02de7e60bbbffd7e7" "subnet-0183e1bfeb8053643") 

echo "Creating ECR API endpoint..."
ECR_API_ID=$(aws ec2 create-vpc-endpoint \
  --region "$REGION" \
  --vpc-id "$VPC_ID" \
  --vpc-endpoint-type Interface \
  --service-name "com.amazonaws.${REGION}.ecr.api" \
  --subnet-ids "${SUBNET_IDS[@]}" \
  --security-group-ids "$SECURITY_GROUP_ID" \
  --private-dns-enabled \
  --query "VpcEndpoint.VpcEndpointId" \
  --output text)

aws ec2 create-tags \
  --region "$REGION" \
  --resources "$ECR_API_ID" \
  --tags Key=Name,Value="ljs-project2-vpc-ecr-api-endpoint"

echo "Creating ECR DKR (image layer download) endpoint..."
ECR_DKR_ID=$(aws ec2 create-vpc-endpoint \
  --region "$REGION" \
  --vpc-id "$VPC_ID" \
  --vpc-endpoint-type Interface \
  --service-name "com.amazonaws.${REGION}.ecr.dkr" \
  --subnet-ids "${SUBNET_IDS[@]}" \
  --security-group-ids "$SECURITY_GROUP_ID" \
  --private-dns-enabled \
  --query "VpcEndpoint.VpcEndpointId" \
  --output text)

aws ec2 create-tags \
  --region "$REGION" \
  --resources "$ECR_DKR_ID" \
  --tags Key=Name,Value="ljs-project2-vpc-ecr-dkr-endpoint"

echo "Fetching private route tables..."
PRIVATE_ROUTE_TABLES=$(aws ec2 describe-route-tables \
  --region "$REGION" \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "RouteTables[?Associations[?SubnetId=='${SUBNET_IDS[0]}' || SubnetId=='${SUBNET_IDS[1]}']].RouteTableId" \
  --output text)

echo "Creating S3 Gateway endpoint..."
S3_EP_ID=$(aws ec2 create-vpc-endpoint \
  --region "$REGION" \
  --vpc-id "$VPC_ID" \
  --vpc-endpoint-type Gateway \
  --service-name "com.amazonaws.${REGION}.s3" \
  --route-table-ids $PRIVATE_ROUTE_TABLES \
  --query "VpcEndpoint.VpcEndpointId" \
  --output text)

aws ec2 create-tags \
  --region "$REGION" \
  --resources "$S3_EP_ID" \
  --tags Key=Name,Value="ljs-project2-vpc-s3-endpoint"

LOGS_EP_ID=$(aws ec2 create-vpc-endpoint \
  --region "$REGION" \
  --vpc-id "$VPC_ID" \
  --vpc-endpoint-type Interface \
  --service-name "com.amazonaws.${REGION}.logs" \
  --subnet-ids "${SUBNET_IDS[@]}" \
  --security-group-ids "$SECURITY_GROUP_ID" \
  --private-dns-enabled \
  --query "VpcEndpoint.VpcEndpointId" \
  --output text)

aws ec2 create-tags \
  --region "$REGION" \
  --resources "$LOGS_EP_ID" \
  --tags Key=Name,Value="ljs-project2-vpc-logs-endpoint"

echo "All endpoints created"
