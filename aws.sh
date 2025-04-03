#!/bin/bash
#Call with AWS_PROFILE=<profile_name>

read -p "Enter ECS Cluster Name [default: ljs-project2-cluster]: " CLUSTER_NAME
CLUSTER_NAME=${CLUSTER_NAME:-ljs-project2-cluster}

read -p "Enter AWS region [default: us-east-1]: " REGION
REGION=${REGION:-us-east-1}

read -p "Enter a name tag: " NAME_TAG
NAME_TAG=${NAME_TAG}

# Create the ECS cluster
echo "Creating ECS cluster: $CLUSTER_NAME in region: $REGION"
aws ecs create-cluster \
    --cluster-name "$CLUSTER_NAME" \
    --region "$REGION" \
    --tags key="Name",value="$NAME_TAG" \

echo "Cluster '$CLUSTER_NAME' created successfully in region '$REGION'."
