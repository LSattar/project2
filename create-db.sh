#!/bin/bash

DB_USERNAME="root"
DB_PASSWORD="password"
DB_NAME="taxtracker"
SECURITY_GROUP="ljs-project2-db-sg"
DB_CLUSTER_NAME="ljs-project2-db"
REGION="us-east-1"
VPC_ID="vpc-0c24715fddff98b6a"
PRIVATE_SUBNET_1="subnet-02de7e60bbbffd7e7"
PRIVATE_SUBNET_2="subnet-0183e1bfeb8053643"
DB_SUBNET_GROUP_NAME="ljs-project2-db-subnet-group"

echo "Using VPC: $VPC_ID"

# Get Security Group ID from name
SG_ID=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values="$SECURITY_GROUP" \
  --query 'SecurityGroups[0].GroupId' \
  --region "$REGION" \
  --output text)

if [[ "$SG_ID" == "None" || -z "$SG_ID" ]]; then
  echo "Security group '$SECURITY_GROUP' not found."
  exit 1
fi

# Create DB Subnet Group using private subnets
echo "Creating DB subnet group: $DB_SUBNET_GROUP_NAME"
aws rds create-db-subnet-group \
  --db-subnet-group-name "$DB_SUBNET_GROUP_NAME" \
  --db-subnet-group-description "DB subnet group for Aurora in custom VPC" \
  --subnet-ids "$PRIVATE_SUBNET_1" "$PRIVATE_SUBNET_2" \
  --region "$REGION"

# Create Aurora Serverless v2 DB Cluster
echo "Creating Aurora Serverless v2 DB cluster..."
aws rds create-db-cluster \
  --db-cluster-identifier "$DB_CLUSTER_NAME" \
  --engine aurora-mysql \
  --engine-version 8.0.mysql_aurora.3.05.2 \
  --database-name "$DB_NAME" \
  --master-username "$DB_USERNAME" \
  --master-user-password "$DB_PASSWORD" \
  --vpc-security-group-ids "$SG_ID" \
  --db-subnet-group-name "$DB_SUBNET_GROUP_NAME" \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=2 \
  --region "$REGION"

# Wait for DB cluster to be available
echo "Waiting for DB cluster '$DB_CLUSTER_NAME' to become available..."
aws rds wait db-cluster-available \
  --db-cluster-identifier "$DB_CLUSTER_NAME" \
  --region "$REGION"
echo "DB cluster is now available."

# Create Aurora Serverless v2 Instance
echo "Creating DB instance in Serverless v2 cluster..."
aws rds create-db-instance \
  --db-instance-identifier "${DB_CLUSTER_NAME}-instance" \
  --db-cluster-identifier "$DB_CLUSTER_NAME" \
  --engine aurora-mysql \
  --db-instance-class db.serverless \
  --region "$REGION"

# Wait for DB instance to become available
echo "Waiting for DB instance to become available..."
aws rds wait db-instance-available \
  --db-instance-identifier "${DB_CLUSTER_NAME}-instance" \
  --region "$REGION"
echo "Aurora Serverless v2 instance is now ready!"
