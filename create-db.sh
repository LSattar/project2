#!/bin/bash

DB_PORT=3306
DB_USERNAME="root"
DB_PASSWORD="password"
DB_NAME="taxtracker"
SECURITY_GROUP="ljs-project2-securitygroup"
REGION="us-east-1"

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

aws rds create-db-cluster \
--db-cluster-identifier \
--region $REGION \
--engine aurora-mysql \
--engine-version 8.0.mysql_aurora.3.05.2 \
--master-username  $DB_USERNAME\
--master-user-password $DB_PASSWORD\
--vpc-security-group-ids $SG_ID

