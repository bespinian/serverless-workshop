# Level Up Your Serverless Game

This workshop consists of multiple levels of increasing difficulty. The basic track of this course uses the [AWS Web Console](https://console.aws.amazon.com/). However, if you prefer working with the [AWS CLI version 2](https://aws.amazon.com/cli/) or with [Terraform](https://www.terraform.io/), you may switch to one of these technologies at any stage in the course. All serverless function in this course are written in Node.js. If you stay on the basic track, you will only need to have the Node.js runtime and `npm` installed on your machine. If you want to switch to the CLI or to Terraform, you need to follow the optional installation instructions below.

## Preparation

At the start of the course, take care of the following tasks:

### Ensure Node.js and npm are installed

Ensure that you have Node.js runtime version 14.x or higher installed on your machine. If you need to install it, follow [the instructions on the Node.js site](https://nodejs.org/). Furthermore, you will also need the `npm` CLI. After the Node.js installation, type `npm` in a shell, to check that it is available.

### Clone this repo

Next you will need this repo on you own machine. Run `git clone https://github.com/bespinian/serverless-workshop.git` to clone this repo with all its steps

### Test your AWS login

Last but not least, you will of course also need access to AWS. You have received an AWS Account ID, an IAM user name and a password from the trainers. Navigate to <https://console.aws.amazon.com/>, choose "IAM user", and enter the Account ID and then your credentials. This logs you into the console. From there you should be able to reach the service `Lambda`.

### Optional: Install the AWS CLI

#### Installation

If you want to also work on some of the optional extra topics of this course, you need to install the AWS CLI on your machine. Follow the [AWS CLI installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and choose the installation method best suited for your operating system.

#### Authentication

In order to authenticate your CLI you first need to create an access key by performing the following steps:

1. Log in to the AWS Console with your credentials
1. Click on your name in the top right of the screen
1. Click `My Security Credentials` in the dropdown
1. Click `Create Access Key` under `Access keys for CLI, SDK, & API access`

   Then, you need to configure your CLI with access key ID and the secret access key.

1. Type `aws configure` in your terminal
1. Copy your access key ID and the secret access key from the web console and paste them at the prompts
1. Choose `eu-central-1` as the default region name
1. Test the connection by typing `aws sts get-caller-identity` in your terminal. You should see some basic information about your user.

### Optional: Install Terraform

Some optional extra topics also require Terraform, which you need to install on your machine. Follow the [Terraform installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli) and choose the installation method best suited for your operating system.

## Level 0 - This is easy!

In this level, you will learn how to create a first simple function in AWS Lambda. You will also learn how to pass configuration parameters into a function using environment variables. Furthermore, you will see that AWS has a very strict, deny-by-default permission scheme.

### Steps

Work through the following steps:

1. Go to the [AWS Lambda GUI](https://console.aws.amazon.com/lambda)
1. Choose **Europe (Frankfurt) eu-central-1** as the region in the top right corner
1. Click on `Create function`
1. Choose `my-function-AWSUSER` as the function name, replacing `AWSUSER` with your user name
1. Choose `Node.js 14.x` as the runtime
1. Open the section `Change default execution role` and note that the UI automatically creates an execution role behind the scenes, granting the function certain privileges
1. Click `Create function`
1. Copy the code from [./level-0/function/index.js](https://github.com/bespinian/serverless-workshop/blob/main/level-0/function/index.js) and paste it into the code editor field
1. Press the `Deploy` button
1. In the `Configuration` tab under `Environment variables`, set a variable called `NAME` to the name of a person you like
1. In the `Test` tab, Press the `Test` button and create a test event called `test`
1. Press the `Test` button again to run the test
1. Observe the test output

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Set the AWSUSER environment variable.

   ```shell
   export AWSUSER=<your AWS username>
   ```

1. Create an execution role which will allow Lambda functions to access AWS resources:

   ```shell
   aws iam create-role --role-name lambda-exec-cli-"$AWSUSER" --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }] }'
   ```

1. Grant certain permissions to your newly created role. The managed policy `AWSLambdaBasicExecutionRole` has the permissions needed to write logs to CloudWatch:

   ```shell
   aws iam attach-role-policy --role-name lambda-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   ```

1. Create a deployment package for your function:

   ```shell
   zip -j function.zip level-0/function/index.js
   ```

1. Find out your Account ID by clicking your username in the top right corner. Then set it as a variable in your shell.

   ```shell
   export ACCOUNT_ID=<your account ID>
   ```

1. Create the function:

   ```shell
    aws lambda create-function --function-name my-function-cli-"$AWSUSER" --zip-file fileb://function.zip --handler index.handler --runtime nodejs14.x --role arn:aws:iam::"$ACCOUNT_ID":role/lambda-exec-cli-"$AWSUSER"
   ```

1. Set the `NAME` environment variable to your user name:

   ```shell
   aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --environment "Variables={NAME='$AWSUSER'}"
   ```

1. Invoke the function:

   ```shell
   aws lambda invoke --function-name my-function-cli-"$AWSUSER" output.json --log-type Tail
   ```

1. Invoke the function and decode the logs:

   ```shell
   aws lambda invoke --function-name my-function-cli-"$AWSUSER" output.json --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Copy the Terraform module and the function code to a separate working directory

   ```shell
   mkdir my-tf-module
   cp level-0/advanced/terraform/* my-tf-module
   cp -r level-0/function my-tf-module
   ```

1. Navigate to the Terraform module in your work directory

   ```shell
   pushd my-tf-module
   ```

1. Initialize the Terraform module

   ```shell
   terraform init
   ```

1. Set your AWS user name as an environment variable for Terraform

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Apply the Terraform module

   ```shell
   terraform apply
   ```

1. Invoke the function

   ```shell
   aws lambda invoke --function-name=$(terraform output -raw function_name) output.json
   ```

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 1 - Loggin' it!

To reach level 1, you'll need to learn about the following topics:

- Logging
- Event parameters
- Permissions

### Steps

1. In the Lambda GUI of your function, copy the code from [./level-1/function/index.js](https://github.com/bespinian/serverless-workshop/blob/main/level-1/function/index.js) and paste it over the existing code in the editor field
1. Press the `Deploy` button
1. Press the `Test` button and create a test event called `bob`
1. Paste the following JSON object to the editor field

   ```json
   {
     "name": "Bob"
   }
   ```

1. Press the `Test` button again to run the test
1. Navigate to the tab `Monitor`
1. Click `View logs in CloudWatch`
1. Look for a recent log stream and open it
1. Check for lines looking like this

   ```txt
   2021-09-10T12:26:33.779Z c70ee5e7-4295-4408-a713-9f3ceaaa53e3 INFO Bob invoked me
   2021-09-10T12:26:33.779Z c70ee5e7-4295-4408-a713-9f3ceaaa53e3 ERROR Oh noes!
   ```

1. Navigate to the tab `Configuration` and click on the category `Permissions`.
1. Observe the logging permissions which were assigned to your function automatically.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

   ```shell
   export AWSUSER=<your AWS username>
   export ACCOUNT_ID=<your account ID>
   ```

1. Create a deployment package for your new function:

   ```shell
   zip -j function.zip level-1/function/index.js
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://function.zip
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-cli-"$AWSUSER" --cli-binary-format raw-in-base64-out --payload '{ "name": "Bob" }' output.json --log-type Tail
   ```

1. Find the latest log stream for your function in CloudWatch:

   ```shell
   aws logs describe-log-streams --log-group-name=/aws/lambda/my-function-cli-"$AWSUSER"
   ```

1. Inspect the log events of the log stream. You might have to escape some characters in the value passed in `--log-stream-name`

   ```shell
   aws logs get-log-events --log-group-name=/aws/lambda/my-function-cli-"$AWSUSER" --log-stream-name=<name of latest log stream>
   ```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your user variable is still set

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Navigate to the Terraform module

   ```shell
   cp -r level-1/function my-tf-module
   ```

1. Navigate to your work directory

   ```shell
   pushd my-tf-module
   ```

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-tf-"$TF_VAR_aws_user" --cli-binary-format raw-in-base64-out --payload '{ "name": "Bob" }' output.json --log-type Tail
   ```

1. Find the latest log stream for your function in CloudWatch:

   ```shell
   aws logs describe-log-streams --log-group-name=/aws/lambda/my-function-tf-"$TF_VAR_aws_user"
   ```

1. Inspect the log events of the log stream:

   ```shell
   aws logs get-log-events --log-group-name=/aws/lambda/my-function-tf-"$TF_VAR_aws_user" --log-stream-name=<name of latest log stream>
   ```

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 2 - Tracin' it!

To reach level 2, you will learn about tracing in your function using AWS X-Ray.
Additionally, we will use a DynamoDB table, and trace calls from the function to the table.

We modify the function to read a joke from a joke table and change the function parameters to receive a `jokeID` parameter by which it reads from the database.

### Steps

1. From your terminal, `cd` into the [./level-2/function](https://github.com/bespinian/serverless-workshop/tree/main/level-2/function) directory of this repo
1. Run `npm install`
1. Create a zip file from the folder [./level-2/function](https://github.com/bespinian/serverless-workshop/tree/main/level-2/function) and upload it to the function

   ```shell
   zip -r function.zip .
   ```

1. Press the `Deploy` button
1. In the `Configuration` tab, click `Permissions` and then the link to the execution role
1. Click the `Attach Policies` button and add the "AmazonDynamoDBReadOnlyAccess" and the "AWSXRayDaemonWriteAccess" permissions to grant your function access to DynamoDB and the X-Ray service
1. In the `Configuration` tab of the lambda function, select the `Monitoring and operations tools`, click edit and enable `Active tracing` in the `AWS X-Ray` section.
1. On the functions `Test` tab create a test event with the following payload `{ "jokeID": "1" }` and click the `Test` button. You should see the joke loaded from the database in the response.
1. On the `Monitor` tab, select the `Traces` menu option and inspect the service map as well as the individual traces. Click on one of the traces to get familiar of what info you have available, such as how long the request to query the DynamoDB took.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

   ```shell
   export AWSUSER=<your AWS username>
   export ACCOUNT_ID=<your account ID>
   ```

1. Attach a policy for X-Ray access to your role

   ```shell
   aws iam attach-role-policy --role-name lambda-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess
   ```

1. Create a policy for access to the jokes table in DynamoDB

   ```shell
   aws iam create-policy --policy-name read-jokes-db-table-cli-"$AWSUSER" --policy-document '{ "Version": "2012-10-17", "Statement": [{ "Sid": "ReadWriteTable", "Effect": "Allow", "Action": [ "dynamodb:BatchGetItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan" ], "Resource": "arn:aws:dynamodb:eu-central-1:'$ACCOUNT_ID':table/jokes" }]}'
   ```

1. Attach the policy to your role

   ```shell
   aws iam attach-role-policy --role-name lambda-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::"$ACCOUNT_ID":policy/read-jokes-db-table-cli-"$AWSUSER"
   ```

1. Create a deployment package for your new function:

   ```shell
   pushd ./level-2/function
   npm install
   zip -r function.zip ./*
   popd
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://level-2/function/function.zip
   ```

1. Switch on X-Ray tracing for your function

   ```shell
   aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --tracing-config "Mode=Active"
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-cli-"$AWSUSER" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

1. Inspect the traces that have been created during the last 20 minutes:

   ```shell
   aws xray get-service-graph --start-time $(($(date +"%s") -1200)) --end-time $(date +"%s")
   ```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your work directory and user variables are still set

   ```shell
   export WORKDIR=<your work directory>
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Copy the new function code and the updated Terraform resources to your work directory

   ```shell
   cp level-2/advanced/terraform/* my-tf-module
   cp -r level-2/function my-tf-module
   ```

1. Install the functions dependencies

   ```shell
   pushd my-tf-module/function
   npm install
   popd
   ```

1. Navigate to your Terraform module

   ```shell
   pushd my-tf-module
   ```

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Switch on X-Ray tracing for your function

   ```shell
   aws lambda update-function-configuration --function-name my-function-tf-"$TF_VAR_aws_user" --tracing-config "Mode=Active"
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-tf-"$TF_VAR_aws_user" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

1. Inspect the traces that have been created during the last 20 minutes:

   ```shell
   aws xray get-service-graph --start-time $(($(date +"%s") -1200)) --end-time $(date +"%s")
   ```

1. Navigate back to the workshop repo

   ```shell
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

   ```shell
   export AWSUSER=<your AWS username>
   export ACCOUNT_ID=<your account ID>
   ```

1. Create a deployment package for your new function:

   ```shell
   pushd ./level-3/function
   npm install
   zip -r function.zip ./*
   popd
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://level-3/function/function.zip
   ```

1. Update the function's timeout setting to 1 second:

   ```shell
   aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --timeout 1
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-cli-"$AWSUSER" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

1. Note that the function succeeds, but in the output tells you, that it ran into a timeout.

1. Update the function's timeout setting to 2 seconds:

   ```shell
   aws lambda update-function-configuration --function-name my-function-cli-"$AWSUSER" --timeout 2
   ```

1. Invoke the function again with a test event:

   ```shell
   aws lambda invoke --function-name my-function-cli-"$AWSUSER" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

1. Note that the function succeeds and returns the joke.

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your work directory and user variables are still set

   ```shell
   export WORKDIR=<your work directory>
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Copy the terraform module and the function code from level 3

   ```shell
   cp -r level-3/advanced/terraform my-tf-module
   cp -r level-3/function my-tf-module
   ```

1. Install the functions dependencies

   ```shell
   pushd my-tf-module/function
   npm install
   popd
   ```

1. Navigate to your Terraform module

   ```shell
   pushd my-tf-module
   ```

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-tf-"$TF_VAR_aws_user" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

   Note that the function returns but the response contains an error message because it ran into a timeout.

1. Change the timeout setting of the function in the terraform module in your working directory

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Invoke the function with another test event:

   ```shell
   aws lambda invoke --function-name my-function-tf-"$TF_VAR_aws_user" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

   Note that the function returns successfully and the response contains the joke loaded from the database.

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 4 - Optimized Cold Starts!

To reach level 4, you will need to reduce the cold start time of your function. Warmers are usually not recommended but you can try moving initialization code outside of your handler.

### Steps

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
1. Click on `Functions` in the left navigation
1. Choose the function `my-function-AWSUSER`, which you updated in level 3
1. Run `npm install` in the folder [./level-4/function](https://github.com/bespinian/serverless-workshop/tree/main/level-4/function)
1. Create a zip file from the folder [./level-4/function](https://github.com/bespinian/serverless-workshop/tree/main/level-4/function) and upload it to the function
1. Press the `Deploy` button
1. Press the `Test` button and create a test event called `joke`
1. Paste the following JSON object to the editor field

   ```json
   {
     "jokeID": "1"
   }
   ```

1. Press the `Test` button again to run the test
1. Observe the test output

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

   ```shell
   export AWSUSER=<your AWS username>
   export ACCOUNT_ID=<your account ID>
   ```

1. Create a deployment package for your new function:

   ```shell
   pushd ./level-4/function
   npm install
   zip -r function.zip ./*
   popd
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name my-function-cli-"$AWSUSER" --zip-file fileb://level-4/function/function.zip
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-cli-"$AWSUSER" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' output.json --log-type Tail
   ```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your user variable is still set

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Copy the updated function code to your working directory

   ```shell
   cp -r level-4/function my-tf-module
   ```

1. Install the functions dependencies

   ```shell
   pushd my-tf-module/function
   npm install
   popd
   ```

1. Navigate to your Terraform module

   ```shell
   pushd my-tf-module
   ```

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-tf-"$TF_VAR_aws_user" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' output.json --log-type Tail
   ```

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 5 - Decouplin' it!

To reach level 5, you'll need to learn how to decouple multiple functions asynchronously via a message queue.

### Steps

1. Navigate to to the level 5 code and install the dependencies:

   ```shell
   cd level-5/function
   npm install
   ```

1. Package your function

   ```shell
   zip -r function.zip ./*
   ```

1. In the Lambda GUI, create a new function called `sender-AWSUSER` (replace AWSUSER with your username) and leave all the defaults
1. Create another function called `recipient-AWSUSER` (replace AWSUSER with your username) and leave all the defaults
1. Upload `function.zip` to both functions and inspect the file. It defines and exports two different handlers. The first one sends an event to an SQS queue and the second one receives it.
1. Scroll down to `Runtime settings` and change the Handler to `index.senderHandler` for the sender function and to `index.recipientHandler` for the recipient function. For Node.js, the "index" part refers to the file name and the "handler" part to the name of the export. So we can have multiple functions in the same source code.
1. Head over to the [SQS GUI](https://eu-central-1.console.aws.amazon.com/sqs/v2/home) and create a new queue called `messages-AWSUSER` replacing AWSUSER with your user name and leave all the defaults. Then copy the URL of your newly created function to the clipboard. The URL can be found in the "Details" of the queue.
1. Set the `SQS_QUEUE_URL` environment variable to the name of the queue you have just created for the sender function
1. Give the sender function the permission to send messages to the queue by clicking its role name in the "Configuration" tab under "Permissions". Then attach the policy called `AmazonSQSFullAccess`.
1. Give the recipient function the permission to read messages from the queue by clicking its role name in the "Configuration" tab under "Permissions". Then attach the policy called `AWSLambdaSQSQueueExecutionRole`.
1. Go to the recipient's GUI and add a trigger by clicking the "Add trigger" button. Then choose "SQS" and choose your newly created queue.
1. Trigger your sender function with a test event
1. Head over to CloudWatch to examine the logs of the sender function. It has dispatched a message to the message queue.
1. Examine the logs of the recipient function. It has been asynchronously triggered by the sender function via the message queue.

### Already done? Try some of the bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the AWSUSER and ACCOUNT_ID environment variables are still set.

   ```shell
   export AWSUSER=<your AWS username>
   ```

1. Create a deployment package for your new functions:

   ```shell
   cd level-5/function
   npm install
   zip -r function.zip ./*
   ```

1. Create two new roles:

   ```shell
   aws iam create-role --role-name sender-exec-cli-"$AWSUSER" --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }] }'
   aws iam create-role --role-name recipient-exec-cli-"$AWSUSER" --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }] }'

   ```

1. Create two new functions:

   ```shell
   export SENDER_ROLE_ARN=$(aws iam get-role --role-name sender-exec-cli-"$AWSUSER" --query Role.Arn --output text)
   aws lambda create-function --function-name sender-cli-"$AWSUSER" --zip-file fileb://function.zip --handler index.senderHandler --runtime nodejs14.x --role "$SENDER_ROLE_ARN"
   export RECIPIENT_ROLE_ARN=$(aws iam get-role --role-name recipient-exec-cli-"$AWSUSER" --query Role.Arn --output text)
   aws lambda create-function --function-name recipient-cli-"$AWSUSER" --zip-file fileb://function.zip --handler index.recipientHandler --runtime nodejs14.x --role "$RECIPIENT_ROLE_ARN"
   ```

1. Create a new message queue

   ```shell
   aws sqs create-queue --queue-name messages-cli-"$AWSUSER"
   ```

1. Set the `SQS_QUEUE_URL` environment variable of the sender function to the queue's URL:

   ```shell
   export SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name messages-cli-"$AWSUSER" --query QueueUrl --output text)
   aws lambda update-function-configuration --function-name sender-cli-"$AWSUSER" --environment "Variables={SQS_QUEUE_URL='$SQS_QUEUE_URL'}"
   ```

1. Give your sender function the permission to log and to post messages to the queue:

   ```shell
   aws iam attach-role-policy --role-name sender-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   aws iam attach-role-policy --role-name sender-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess
   ```

1. Give your recipient function the permission to log and read messages from the queue:

   ```shell
   aws iam attach-role-policy --role-name recipient-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   aws iam attach-role-policy --role-name recipient-exec-cli-"$AWSUSER" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole
   ```

1. Set the SQS queue as a trigger for the recipient function:

   ```shell
   export SQS_QUEUE_ARN=$(aws sqs get-queue-attributes --queue-url "$SQS_QUEUE_URL" --attribute-names QueueArn --query Attributes.QueueArn --output text)
   aws lambda create-event-source-mapping --function-name recipient-cli-"$AWSUSER" --event-source-arn "$SQS_QUEUE_ARN"
   ```

1. Invoke the sender function:

   ```shell
   aws lambda invoke --function-name sender-cli-"$AWSUSER" output.json --log-type Tail
   ```

1. Check out the logs of the sender function to see that the message has been sent:

   ```shell
   aws logs tail /aws/lambda/sender-cli-"$AWSUSER"
   ```

1. Check out the logs of the recipient function to see that it has been triggered and the message has been received:

   ```shell
   aws logs tail /aws/lambda/recipient-cli-"$AWSUSER"
   ```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your user variable is still set

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Copy the updated function code to your working directory

   ```shell
   cp -r level-5/function my-tf-module
   ```

1. Install the functions dependencies

   ```shell
   pushd my-tf-module/function
   npm install
   popd
   ```

1. Navigate to your Terraform module

   ```shell
   pushd my-tf-module
   ```

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Invoke the sender function with a test event:

   ```shell
   aws lambda invoke --function-name sender-tf-"$TF_VAR_aws_user" --cli-binary-format raw-in-base64-out output.json --log-type Tail
   ```

1. Check out the logs of the sender function to see that the message has been sent:

   ```shell
   aws logs tail /aws/lambda/sender-tf-"$TF_VAR_aws_user"
   ```

1. Check out the logs of the recipient function to see that it has been triggered and the message has been received:

   ```shell
   aws logs tail /aws/lambda/recipient-tf-"$TF_VAR_aws_user"
   ```

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 6 - Infra as Code

Infrastructure as code allows us to to manage the deployments of our functions and other cloud resources in a much more repeatable and testable way, bringing us to the next level.

To deploy the function from level-4 and it's required resources, follow the steps below.
You can also use this to deploy it to your own AWS account with very few commands.

### Prerequisites

For this step, need Terraform installed on your machine.
Follow the [Terraform installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli) and choose the installation method best suited for your operating system.

### Steps

> Note!
>
> If you have done some extra work and already deployed the previous levels with Terraform, you may skip this level as it redeploys the code from level 4.

1. Copy the Terraform module and the function code to a separate working directory

   ```shell
   mkdir my-tf-module
   cp level-6/advanced/terraform/* my-tf-module
   cp -r level-6/function my-tf-module
   ```

1. Navigate to the Terraform module in your work directory

   ```shell
   pushd my-tf-module
   ```

1. Initialize the Terraform module

   ```shell
   terraform init
   ```

1. Set your AWS user name as an environment variable for Terraform

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Copy the updated function code to your working directory

   ```shell
   cp -r level-6/function my-tf-module
   ```

1. Install the functions dependencies

   ```shell
   pushd my-tf-module/function
   npm install
   popd
   ```

1. Navigate to your Terraform module

   ```shell
   pushd my-tf-module
   ```

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name my-function-tf-"$TF_VAR_aws_user" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' output.json --log-type Tail
   ```

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

## Level 7 - Testing ... duh!

To reach level 7 you need to know how to

- Unit test your functions
- Run your functions locally to make debugging easier

### Steps

1. Navigate to to the unit test example and install the dependencies:

   ```shell
   pushd level-7/unit-tests
   npm install
   ```

1. Inspect the example function, the service mocks and the tests:

   ```shell
   cat index.js
   cat index.test.js
   ```

1. Run the tests for the example function:

   ```shell
   npm test
   popd
   ```

1. Navigate to the local execution example and install the dependencies

   ```shell
   pushd level-7/api-to-serverless
   npm install
   ```

1. Inspect the express API and the function code

   ```shell
   cat api.js
   cat index.js
   ```

1. Run the example locally as an express API:

   ```shell
   npm start
   ```

1. Make a request to the API in a new terminal:

   ```shell
   curl -X GET http://localhost:3000 -H 'Content-Type:application/json' -d '{ "name":"Bob" }'
   ```

1. Package your function

   ```shell
   zip -r function.zip ./*
   ```

1. Deploy your function using the UI, the CLI or Terraform and invoke it with a test event of the following form:

   ```json
   {
     "name": "Bob"
   }
   ```
