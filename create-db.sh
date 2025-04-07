#!/bin/bash

DB_USERNAME="root"
DB_PASSWORD="password"
DB_NAME="taxtracker"
SECURITY_GROUP="ljs-project2-securitygroup"
DB_CLUSTER_NAME="ljs-project2-db"
REGION="us-east-1"

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

# Get Security Group ID (fix variable name here)
SG_ID=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values="$SECURITY_GROUP" \
  --query 'SecurityGroups[0].GroupId' \
  --region "$REGION" \
  --output text)

if [[ "$SG_ID" == "None" || -z "$SG_ID" ]]; then
  echo "Security group '$SECURITY_GROUP' not found."
  exit 1
fi

# Create Aurora DB Cluster using default subnet group
aws rds create-db-cluster \
  --db-cluster-identifier "$DB_CLUSTER_NAME" \
  --database-name "$DB_NAME" \
  --region "$REGION" \
  --engine aurora-mysql \
  --engine-version 8.0.mysql_aurora.3.05.2 \
  --master-username "$DB_USERNAME" \
  --master-user-password "$DB_PASSWORD" \
  --vpc-security-group-ids "$SG_ID" \
  --db-subnet-group-name default

# Create DB instance
aws rds create-db-instance \
--db-instance-identifier "${DB_CLUSTER_NAME}-instance" \
--db-cluster-identifier "$DB_CLUSTER_NAME" \
--engine aurora-mysql \
--db-instance-class db.t3.medium \
--region "$REGION"
