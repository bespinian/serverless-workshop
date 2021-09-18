# Level Up Your Serverless Game

This workshop consists of multiple levels of increasing difficulty. The basic track of this course uses the [AWS Web Console](https://console.aws.amazon.com/). However, if you prefer working with the [AWS CLI](https://aws.amazon.com/cli/) or with [Terraform](https://www.terraform.io/) you may switch to one of these technologies at any stage in the course. If you stay on the basic track, there is nothing to install on your machine. If you want to switch to the CLI or to Terraform, you need to follow the optional installation instructions below.

## Preparation

At the start of the course, please take care of the following tasks:

### Test your AWS login

You have received an AWS Account ID, an IAM user name and a password from the trainers. Please navigate to <https://console.aws.amazon.com/>, choose "IAM user", and enter the Account ID and then your credentials. This logs you into the console. From there you should be able to reach the service `Lambda`.

### Optional: install the AWS CLI

#### Installation

If you want to also work on some of the optional extra topics of this course, you need to install the AWS CLI on your machine. Please follow the [AWS CLI installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and choose the installation method best suited for your operating system.

#### Authentication

In order to authenticate your CLI you need to first create an access key by performing the following steps:

1. Log in to the AWS Console with your credentials
2. Click on your name in the top right of the screen
3. Click `My Security Credentials` in the dropdown
4. Click `Create Access Key` under `Access keys for CLI, SDK, & API access`

Then you need to configure your CLI with access key ID and the secret access key

6. Type `aws configure` in your terminal
7. Copy your access key ID and the secret access key from the web console and paste them at the prompts
8. Choose `eu-central-1` as the default region name
9. Test the connection by typing `aws sts get-caller-identity` in your terminal. You should see some basic information about your user.

### Optional: install Terraform

Some optional extra topics also require Terraform, which you need to install on your machine. Please follow the [Terraform installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli) and choose the installation method best suited for your operating system.

## Level 0 - This is easy!

In this level you will learn how to create a first simple function in AWS Lambda. You will also learn how to pass configuration parameters into a function using environment variables. Furthermore, you will see that AWS has a very strict, deny-by-default permission scheme.

### Steps

Please work through the following steps:

1. Go to the [AWS Lambda GUI](https://console.aws.amazon.com/lambda)
1. Click on `Create function`
1. Choose `my-function-AWSUSER` as the function name, replacing `AWSUSER` with you user name
1. Choose `Node.js 14.x` as the runtime
1. Open the section `Change default execution role` and note that the UI automatically creates an execution role behind the scenes, granting the function certain privileges
1. Click `Create function`
1. Copy the code from [./level-0/function/index.js](https://github.com/bespinian/serverless-workshop/blob/main/level-0/function/index.js) and paste it into the code editor field
1. Press the `Deploy` button
1. Set environment variable `NAME` in the `Configuration` tab under `Environment variables`
1. Press the `Test` button and create a test event called `test`
1. Press the `Test` button again to run the test
1. Observe the test output

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Set the AWSUSER environment variable.

```
export AWSUSER=<your AWS username>
```

2. Create an execution role which will allow Lambda functions to access AWS resources:

```
aws iam create-role --role-name lambda-exec-cli-"$AWSUSER" --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'
```

3. Grant certain permissions to your newly created role. The managed policy `AWSLambdaBasicExecutionRole` has the permissions needed to write logs to CloudWatch:

```
aws iam attach-role-policy --role-name lambda-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

4. Create a deployment package for your function:

```
zip -j function.zip level-0/function/index.js
```

5. Create the function:

Find out your Account ID by clicking your username in the top right corner.

```
export ACCOUNT_ID=<your account ID>

aws lambda create-function --function-name my-function-cli-"$AWSUSER" --zip-file fileb://function.zip --handler index.handler --runtime nodejs14.x --role arn:aws:iam::"$ACCOUNT_ID":role/lambda-exec-cli-"$AWSUSER"
```

6. Set the `NAME` environment variable to your user name:

```
aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --environment "Variables={NAME='$AWSUSER'}"
```

7. Invoke the function:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --log-type Tail
```

8. Invoke the function and decode the logs:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --log-type Tail --query 'LogResult' --output text |  base64 -d
```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Copy the Terraform module to a directory of your choice

```
export WORKDIR=<your work directory>
mkdir $WORKDIR
cp level-0/advanced/terraform/* $WORKDIR
cp -r level-0/function $WORKDIR
```

2. Navigate to the Terraform module in your work directory

```
pushd $WORKDIR
```

3. Initialize the Terraform module

```
terraform init
```

4. Set your AWS user name as a environment variable for Terraform

```
export TF_VAR_aws_user=<your AWS user name>
```

5. Apply the Terraform module

```
terraform apply
```

6. Invoke the function

```
aws lambda invoke --function-name=$(terraform output -raw function_name) response.json
```

7. Navigate back to the workshop repo

```
popd
```

</details>

## Level 1 - Loggin' it!

To reach level 1, you'll need to learn about the following topics:

- Logging
- Event parameters
- Permissions

### Steps

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
2. Click on `Functions` in the left navigation
3. Choose the function `my-function-AWSUSER`, which you created in level 0
4. Copy the code from [./level-1/function/index.js](https://github.com/bespinian/serverless-workshop/blob/main/level-1/function/index.js) and paste it over the existing code in the editor field
5. Press the `Deploy` button
6. Press the `Test` button and create a test event called `bob`
7. Paste the following JSON object to the editor field

```
{
  "name": "Bob"
}
```

11. Press the `Test` button again to run the test
12. Navigate to the tab `Monitor`
13. Click `View logs in CloudWatch`
14. Look for a recent log stream and open it
15. Check for lines looking like this

```
2021-09-10T12:26:33.779Z c70ee5e7-4295-4408-a713-9f3ceaaa53e3 INFO Bob invoked me

2021-09-10T12:26:33.779Z c70ee5e7-4295-4408-a713-9f3ceaaa53e3 ERROR Oh noes!
```

16. Navigate to the tab `Configuration` and click on the category `Permissions`.
17. Observe the logging permissions which were assigned to your function automatically.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

```
export AWSUSER=<your AWS username>

export ACCOUNT_ID=<your account ID>
```

2. Create a deployment package for your new function:

```
zip -j function.zip level-1/function/index.js
```

5. Update the function with the new code:

```
aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://function.zip
```

6. Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" --cli-binary-format raw-in-base64-out --payload '{ "name": "Bob" }' out --log-type Tail
```

7. Find the latest log stream for your function in CloudWatch:

```
aws logs describe-log-streams --log-group-name=/aws/lambda/my-function-cli-"$AWSUSER"
```

8. Inspect the log events of the log stream. You might have to escape some characters in the value passed in `--log-stream-name`

```
aws logs get-log-events --log-group-name=/aws/lambda/my-function-cli-"$AWSUSER" --log-stream-name=<name of latest log stream>
```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your work directory and user variables are still set

```
export WORKDIR=<your work directory>
export TF_VAR_aws_user=<your AWS user name>
```

2. Navigate to the Terraform module

```
cp -r level-1/function $WORKDIR
```

3. Navigate to your work directory

```
pushd
```

4. Apply the Terraform module again

```
terraform apply
```

5. Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" --cli-binary-format raw-in-base64-out --payload '{ "name": "Bob" }' out --log-type Tail
```

6. Find the latest log stream for your function in CloudWatch:

```
aws logs describe-log-streams --log-group-name=/aws/lambda/my-function-cli-"$AWSUSER"
```

7. Inspect the log events of the log stream:

```
aws logs get-log-events --log-group-name=/aws/lambda/my-function-cli-"$AWSUSER" --log-stream-name=<name of latest log stream>
```

8. Navigate back to the workshop repo

```
popd
```

</details>

## Level 2 - Tracin' it!

To reach level 2, you will learn about tracing in your function using AWS XRay.
Additionally, we will use a DynamoDB table, which will allow us to trace calls from the function to the table.

We modify the the function to read a joke from a joke table and change the function parameters to receive a `jokeID` parameter by which it reads from the database.

### Steps

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
1. Click on `Functions` in the left navigation
1. Choose the function `my-function-AWSUSER`, which you updated in level 1
1. Run `npm install` in the folder [./level-2/function](https://github.com/bespinian/serverless-workshop/tree/main/level-2/function)
1. Create a zip file from the folder [./level-2/function](https://github.com/bespinian/serverless-workshop/tree/main/level-2/function) and upload it to the function
1. Press the `Deploy` button
1. Grant DynamoDB permission to function
1. Grant XRay permission to function
1. In the `Configuration` tab of the lambda function, select the `Monitoring and operations tools`, click edit and enable `Active tracing` in the `AWS X-Ray` section.
1. On the functions `Test` tab create a test event with the following payload `{ "jokeID": "1" }` and click the `Test` button. You should see the joke loaded from the database in the response.
1. On the `Monitor` tab, select the `Traces` menu option and inspect the service map as well as the individual traces. Click on one of the traces to get familiar of what info you have available, such as how long the request to query the DynamoDB took.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

```
export AWSUSER=<your AWS username>

export ACCOUNT_ID=<your account ID>
```

2. Attach a policy for XRay access to your role

```
aws iam attach-role-policy --role-name lambda-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess
```

3. Create a policy for access to the Jokes table in DynamoDB

```
aws iam create-policy --policy-name read-jokes-db-table-cli-"$AWSUSER" --policy-document '{ "Version": "2012-10-17", "Statement": [{ "Sid": "ReadWriteTable", "Effect": "Allow", "Action": [ "dynamodb:BatchGetItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan" ], "Resource": "arn:aws:dynamodb:eu-central-1:'$ACCOUNT_ID':table/Jokes" }]}'
```

4. Attach the policy to your role

```
aws iam attach-role-policy --role-name lambda-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::"$ACCOUNT_ID":policy/read-jokes-db-table-cli-"$AWSUSER"
```

5. Create a deployment package for your new function:

```
pushd ./level-2/function
npm install
zip -r function.zip ./*
popd
```

6. Update the function with the new code:

```
aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://level-2/function/function.zip
```

7. Switch on XRay tracing for your function

```
aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --tracing-config "Mode=Active"
```

8. Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
```

9. Inspect the traces that have been created during the last 20 minutes:

```
aws xray get-service-graph --start-time $(($(date +"%s") -1200)) --end-time $(date +"%s")
```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your work directory and user variables are still set

```
export WORKDIR=<your work directory>
export TF_VAR_aws_user=<your AWS user name>
```

2. Copy the new function code and the updated terraform resources to your work directory

```
cp level-2/advanced/terraform/* $WORKDIR
cp -r level-2/function $WORKDIR
```

3. Install the functions dependencies

```
pushd $WORKDIR/function
npm install
popd
```

4. Navigate to your Terraform module

```
pushd $WORKDIR
```

5. Apply the Terraform module again

```
terraform apply
```

7. Switch on XRay tracing for your function

```
aws lambda update-function-configuration --function-name my-function-tf-"$AWSUSER" --tracing-config "Mode=Active"
```

8. Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-tf-"$AWSUSER" out --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
```

9. Inspect the traces that have been created during the last 20 minutes:

```
aws xray get-service-graph --start-time $(($(date +"%s") -1200)) --end-time $(date +"%s")
```

10. Navigate back to the workshop repo

```
popd
```

</details>

## Level 3 - Timin' it!

To reach this level, we'll make sure our function terminates in an orderly fashion within the timeout limit it is configured with.
This means, aborting IO operations or long running calculations when the function time runs out, or at least return to your program flow to handle the return values.
To do this, .  
The AWS Lambda frameworks allow us to poll how much time is still left in a function call, which simplifies this.

Before you deploy the improved function to lambda, inspect the provided code.
You will notice the following points:

- The usage of `context.getRemainingTimeInMillis()` to receive from Lambda how much time is left in our function
- An additional grace period, we retain for our function in `TIMEOUT_GRACE_PERIOD_IN_MILLIS`
- That we trigger a promise, that rejects when the remaining time is below the grace period.

> Note!
>
> Some AWS resources support the usage of an [AbortController](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/interfaces/_aws_sdk_types.abortcontroller-1.html) to terminate those actions.
> When doing IO operations using resources that do not support it or doing long running computations, make sure you set timeouts or implement a timeout check yourself.

### Steps

1. Inspect the provided code as described above
1. Click on `Functions` in the left navigation
1. Choose the function `my-function-AWSUSER`, which you created in level 0
1. In the `Configuration` tab of the function, select the `General configuration` menu and set the timeout to 1 second
1. Note that now only <20ms will be available for the DynamoDB query, because our grace period is set to 980ms
1. Create a zip file from the `function` folder and upload it to the function
1. Press the `Deploy` button
1. On the functions `Test` tab create a test event with the following payload `{ "jokeID": "1" }` and click the `Test` button.
   You should see the function returning successfully, but with a message, that it reached the timeout.
1. Set the timeout to 2 seconds and try again.
   This time, the function should be able to read the joke from the database and return it.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

```
export AWSUSER=<your AWS username>

export ACCOUNT_ID=<your account ID>
```

2. Create a deployment package for your new function:

```
pushd ./level-3/function
npm install
zip -r function.zip ./*
popd
```

3. Update the function with the new code:

```
aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://level-3/function/function.zip
```

4. Update the function's timeout setting to 1 second:

```
aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --timeout 1
```

5.  Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
```

6. Note that the function succeeds, but in the output tells you, that it ran into a timeout.

7. Update the function's timeout setting to 2 seconds:

```
aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --timeout 2
```

8.  Invoke the function again with a test event:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" out --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
```

9. Note that the function succeeds and returns the joke.

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your work directory and user variables are still set

```
export WORKDIR=<your work directory>
export TF_VAR_aws_user=<your AWS user name>
```

2. Copy the terraform module and the function code from level 3

```
cp -r level-3/advanced/terraform $WORKDIR
cp -r level-3/function $WORKDIR
```

3. Apply the Terraform module again

```
terraform apply
```

4. Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-terraform-"$TF_VAR_aws_user" out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
```

Note that the function returns but the response contains an error message because it ran into a timeout.

5. Change the timeout setting of the function in the terraform module in your working directory

6. Apply the Terraform module again

```
terraform apply
```

7. Invoke the function with another test event:

```
aws lambda invoke --function-name my-function-terraform-"$TF_VAR_aws_user" out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
```

Note that the function returns successfully and the response contains the joke loaded from the database.

</details>

## Level 4 - No cold starts!

To reach level 4, you will need to reduce the cold start time of your function. Warmers are usually not recommended but you can try moving initialization code outside of your handler.

### Steps

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
2. Click on `Functions` in the left navigation
3. Choose the function `my-function-AWSUSER`, which you updated in level 3
4. Run `npm install` in the folder [./level-4/function](https://github.com/bespinian/serverless-workshop/tree/main/level-4/function)
5. Create a zip file from the folder [./level-4/function](https://github.com/bespinian/serverless-workshop/tree/main/level-4/function) and upload it to the function
6. Press the `Deploy` button
7. Press the `Test` button and create a test event called `joke`
8. Paste the following JSON object to the editor field

```
{
  "jokeID": "1"
}
```

11. Press the `Test` button again to run the test
12. Observe the test output

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

```
export AWSUSER=<your AWS username>

export ACCOUNT_ID=<your account ID>
```

2. Create a deployment package for your new function:

```
pushd ./level-4/function
npm install
zip -r function.zip ./*
popd
```

5. Update the function with the new code:

```
aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://level-4/function/function.zip
```

6. Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' out --log-type Tail
```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your work directory and user variables are still set

```
export WORKDIR=<your work directory>
export TF_VAR_aws_user=<your AWS user name>
```

2. Copy the updated function code to your working directory

```
cp -r level-4/function $WORKDIR
```

3. Install the functions dependencies

```
pushd $WORKDIR/function
npm install
popd
```

4. Navigate to your Terraform module

```
pushd $WORKDIR
```

5. Apply the Terraform module again

```
terraform apply
```

6. Invoke the function with a test event:

```
aws lambda invoke --function-name my-function-cli-"$AWSUSER" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' out --log-type Tail
```

4. Navigate back to the workshop repo

```
popd
```

</details>

## Level 5 - Decouplin' it!

### Steps

## Level 6 - Infra as Code ... duh!

### Steps
