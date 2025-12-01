#!/usr/bin/env bash

set -euo pipefail

GROUP_NAME="participants"
PASSWORD="Bespinian-1234!"

usage() {
	echo "Usage: $0 <number_of_users>"
	echo "  Creates IAM users named user-01, user-02, etc. and adds them to the '$GROUP_NAME' group."
	exit 1
}

if [[ $# -ne 1 ]]; then
	usage
fi

if ! [[ "$1" =~ ^[0-9]+$ ]]; then
	echo "Error: Argument must be a positive integer"
	usage
fi

NUM_USERS=$1

if [[ $NUM_USERS -lt 1 ]]; then
	echo "Error: Number of users must be at least 1"
	exit 1
fi

# Get list of existing users
existing_users=$(aws iam list-users --query 'Users[].UserName' --output text)

for i in $(seq 1 "$NUM_USERS"); do
	username=$(printf "user-%02d" "$i")

	if echo "$existing_users" | grep -qw "$username"; then
		echo "User $username already exists, skipping creation"
	else
		echo "Creating user $username"
		aws iam create-user --user-name "$username"
	fi

	# Create login profile for console access (skip if already exists)
	if aws iam get-login-profile --user-name "$username" &>/dev/null; then
		echo "Login profile for $username already exists, skipping"
	else
		echo "Creating login profile for $username"
		aws iam create-login-profile --user-name "$username" --password "$PASSWORD" --no-password-reset-required
	fi

	# Add user to group (idempotent - AWS doesn't error if already in group)
	echo "Adding $username to group $GROUP_NAME"
	aws iam add-user-to-group --user-name "$username" --group-name "$GROUP_NAME"
done

echo "Done. Created/verified $NUM_USERS users."
