# Level Up Your Serverless Game

This workshop consists of multiple levels of increasing difficulty. The basic track of this course uses the [AWS Web Console](https://console.aws.amazon.com/). However, as soon as you're done with that track, you can alternatively use the [AWS CLI version 2](https://aws.amazon.com/cli/) or [Terraform](https://www.terraform.io/). You can switch to one of these technologies at any stage in the course. All serverless functions in this course are written in Node.js. If you stay on the basic track, you will only need to have the Node.js runtime and `npm` installed on your machine. If you want to switch to the CLI or to Terraform, you need to follow the optional installation instructions below.

> The commands are geared towards Unix systems. If you're using Windows, you might need to adapt some of them. A more convenient solution is to use [WSL](https://docs.microsoft.com/en-us/windows/wsl/) or [Git BASH](https://git-scm.com/downloads).

## Preparation

At the start of the course, take care of the following tasks:

### Ensure Node.js and npm are installed

Ensure that you have Node.js runtime version 18.x or newer installed on your machine. If you need to install it, follow [the instructions on the Node.js site](https://nodejs.org/). Furthermore, you will also need the `npm` CLI. After the Node.js installation, type `npm` in a shell, to check that it is available.

In case you cannot or do not want to install Node.js and npm, you can also run the commands via a container. For example, using Docker:

```shell
docker run --rm -t -v "${PWD}:/src" -w '/src' docker.io/node:alpine npm install
```

### Clone this repo

Next, you will need this repo on your own machine. Run `git clone https://github.com/bespinian/serverless-workshop.git` to clone this repo with all its steps.

### Test your AWS login

Finally, you will of course also require access to AWS. You have received an AWS Account ID, an IAM user name and a password from the trainers. Navigate to <https://console.aws.amazon.com/>, choose "IAM user", and enter the Account ID and then your credentials. This logs you into the console. From there you should be able to reach the service `Lambda`.

## Level 0 - This is easy!

In this level, you will learn how to create a first simple function in AWS Lambda. You will also learn how to pass configuration parameters into a function using environment variables. Furthermore, you will see that AWS has a very strict, deny-by-default permission scheme.

### Steps

Work through the following steps:

1. Go to the [AWS Lambda GUI](https://console.aws.amazon.com/lambda)
1. Choose **Europe (Frankfurt) eu-central-1** as the region in the top-right corner. All resources you create should be created in that region.
1. Click on `Create function`
1. Choose `my-function-AWSUSER` as the function name, replacing `AWSUSER` with your user name
1. Choose `Node.js 18.x` as the runtime
1. Open the section `Change default execution role` and note that the UI automatically creates an execution role behind the scenes, granting the function certain privileges
1. Click `Create function`
1. Copy the code from [level-0/function/index.mjs](https://github.com/bespinian/serverless-workshop/blob/main/level-0/function/index.mjs) and paste it into the code editor field
1. In the `Configuration` tab under `Environment variables`, set a variable called `NAME` to the name of a person you like
1. In the `Test` tab, press the `Test` button and create a test event called `test`
1. Press the `Test` button again to run the test
1. Observe the test output

### Add an HTTP Trigger

Lambda functions support various Triggers.
Some of the most commonly used ones are:

- HTTP trigger using the API Gateway
- Message queue triggers from Amazon MQ or SQS
- S3 events, such as object creation or deletion events in a bucket
- Apache Kafka events

Work through the following steps to expose your function on the Internet via the API Gateway.

1. In the Functional overview at the top, click `Add trigger`
1. Select `API Gateway`
1. For API, select `Create a new API`
1. Select `HTTP API` as the API Type
1. Select `Open`, in Security
1. Click `Add`
1. Click on the created API and visit the `Integrations` tab
1. Click the `ANY` integration and hit the `Manage integration` button
1. Click `Edit` and expand the `Advanced settings`. In there, choose the "Payload format version" `2.0` and hit the `Save` button
1. You can now close this tab to go back to your function. Changing the integration format was necessary because our function returns the newer and simpler version `2.0` format.
1. You should now see your newly created Trigger and the URL to access it.
   Click the link to see the response in your browser.

### Already done? Try some bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

#### Installation

For the optional CLI steps, you need to install the AWS CLI on your machine. Follow the [AWS CLI installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and choose the installation method best suited for your operating system.

#### Authentication

To authenticate your CLI, you first need to create an access key by performing the following steps:

1. Log in to the AWS Console with your credentials
1. Click on your name in the top right of the screen
1. Click `My Security Credentials` in the dropdown
1. Click `Create Access Key` under `Access keys for CLI, SDK, & API access`

   Then, you need to configure your CLI with access key ID and the secret access key.

1. Type `aws configure` in your terminal
1. Copy your access key ID and the secret access key from the web console and paste them at the prompts
1. Choose `eu-central-1` as the default region name
1. Test the connection by typing `aws sts get-caller-identity` in your terminal. You should see some basic information about your user.

#### Steps

1. Set the `AWSUSER` environment variable.

   ```shell
   export AWSUSER=<your AWS user name>
   ```

1. Create an execution role which will allow Lambda functions to access AWS resources:

   ```shell
   aws iam create-role --role-name "lambda-exec-cli-${AWSUSER}" --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }] }'
   ```

1. Grant certain permissions to your newly created role. The managed policy `AWSLambdaBasicExecutionRole` has the permissions needed to write logs to CloudWatch:

   ```shell
   aws iam attach-role-policy --role-name "lambda-exec-cli-${AWSUSER}" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   ```

1. Create a deployment package for your function:

   ```shell
   zip -j function.zip level-0/function/index.mjs
   ```

1. Find out your Account ID by clicking your user name in the top-right corner. Then set it as a variable in your shell.

   ```shell
   export ACCOUNT_ID=<your account ID>
   ```

1. Create the function:

   ```shell
    aws lambda create-function --function-name "my-function-cli-${AWSUSER}" --zip-file fileb://function.zip --handler index.handler --runtime nodejs18.x --role "arn:aws:iam::${ACCOUNT_ID}:role/lambda-exec-cli-${AWSUSER}"
   ```

1. Set the `NAME` environment variable to your user name:

   ```shell
   aws lambda update-function-configuration --function-name "my-function-cli-${AWSUSER}" --environment "Variables={NAME='${AWSUSER}'}"
   ```

1. Invoke the function:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" output.json --log-type Tail
   ```

1. Invoke the function and decode the logs:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" output.json --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

1. Create an API on the API gateway

   ```shell
   aws apigatewayv2 create-api --name "my-api-gw-cli-${AWSUSER}" --protocol-type HTTP
   ```

1. Set the variable `API_ID` to the ID that was returned by the command above:

   ```shell
   export API_ID=<the API ID>
   ```

1. Create an integration on the API gateway pointing to your Lambda function:

   ```shell
   aws apigatewayv2 create-integration --api-id "$API_ID" --integration-type AWS_PROXY --integration-uri "arn:aws:lambda:eu-central-1:${ACCOUNT_ID}:function:my-function-cli-${AWSUSER}" --payload-format-version 2.0
   ```

1. Set the INTEGRATION_ID variable to the value of `IntegrationId` from the response:

   ```shell
   export INTEGRATION_ID=<the integration id>
   ```

1. Create a route pointing to your integration:

   ```shell
   aws apigatewayv2 create-route --api-id "$API_ID" --route-key "ANY /my-function" --target "integrations/${INTEGRATION_ID}" --authorization-type NONE --no-api-key-required
   ```

1. Create a stage that deploys the configuration:

   ```shell
   aws apigatewayv2 create-stage --api-id "$API_ID" --auto-deploy --stage-name default
   ```

1. Allow the API gateway to access the lambda function:
   ```shell
   aws lambda add-permission --function-name "my-function-cli-${AWSUSER}" --statement-id apigateway-get --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-central-1:${ACCOUNT_ID}:${API_ID}/*/*/my-function"
   ```

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

#### Install Terraform

For the optional Terraform steps, you need to install Terraform on your machine. Follow the [Terraform installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli) and choose the installation method best suited for your operating system.

#### Authentication

To authenticate Terraform, you first need to create an access key by performing the following steps:

1. Log in to the AWS Console with your credentials
1. Click on your name in the top right of the screen
1. Click `My Security Credentials` in the dropdown
1. Click `Create Access Key` under `Access keys for CLI, SDK, & API access`

   Then, you need to configure your machine with access key ID and the secret access key.

1. Type `aws configure` in your terminal
1. Copy your access key ID and the secret access key from the web console and paste them at the prompts
1. Choose `eu-central-1` as the default region name
1. Test the connection by typing `aws sts get-caller-identity` in your terminal. You should see some basic information about your user.

#### Steps

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

1. Invoke the function via the AWS CLI

   ```shell
   aws lambda invoke --function-name "$(terraform output -raw function_name)" output.json
   ```

1. Invoke the function via HTTP.
   Access the `invoke_url` that's returned by `terraform apply` either through your browser or through curl:

   ```shell
   curl <invoke_url>
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

1. In the Lambda GUI of your function, copy the code from [level-1/function/index.mjs](https://github.com/bespinian/serverless-workshop/blob/main/level-1/function/index.mjs) and paste it over the existing code in the editor field
1. In the `Test` tab, press the `Test` button and create a test event called `bob`
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

1. Navigate back to your function in the Lambda console and switch to the tab `Configuration` and click on the category `Permissions`.
1. Observe the logging permissions which were assigned to your function automatically.

### Already done? Try some bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the `AWSUSER` and `ACCOUNT_ID` environment variables are still set.

   ```shell
   export AWSUSER=<your AWS user name>
   export ACCOUNT_ID=<your account ID>
   ```

1. Create a deployment package for your new function:

   ```shell
   zip -j function.zip level-1/function/index.mjs
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name "my-function-cli-${AWSUSER}" --zip-file fileb://function.zip
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" --cli-binary-format raw-in-base64-out --payload '{ "name": "Bob" }' output.json --log-type Tail
   ```

1. Find the latest log stream for your function in CloudWatch:

   ```shell
   aws logs describe-log-streams --log-group-name "/aws/lambda/my-function-cli-${AWSUSER}"
   ```

1. Inspect the log events of the log stream. You might have to escape some characters in the value passed in `--log-stream-name` e.g. `$LATEST` should be `\$LATEST`

   ```shell
   aws logs get-log-events --log-group-name "/aws/lambda/my-function-cli-${AWSUSER}" --log-stream-name=<name of latest log stream>
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
   aws lambda invoke --function-name "my-function-tf-${TF_VAR_aws_user}" --cli-binary-format raw-in-base64-out --payload '{ "name": "Bob" }' output.json --log-type Tail
   ```

1. Find the latest log stream for your function in CloudWatch:

   ```shell
   aws logs describe-log-streams --log-group-name "/aws/lambda/my-function-tf-${TF_VAR_aws_user}"
   ```

1. Inspect the log events of the log stream:

   ```shell
   aws logs get-log-events --log-group-name "/aws/lambda/my-function-tf-${TF_VAR_aws_user}" --log-stream-name=<name of latest log stream>
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

1. From your terminal, `cd` into the [level-2/function](https://github.com/bespinian/serverless-workshop/tree/main/level-2/function) directory of this repo
1. Run `npm install`
1. Create a zip file from the folder [level-2/function](https://github.com/bespinian/serverless-workshop/tree/main/level-2/function)

   ```shell
   zip -r function.zip .
   ```

1. Upload the zip file to the function by using the `Upload from` button
1. In the `Configuration` tab, click `Permissions` and then click the link to the execution role
1. Click the `Add permissions` button, select `Attach policies` and add the "AmazonDynamoDBReadOnlyAccess" and the "AWSXRayDaemonWriteAccess" permissions to grant your function access to DynamoDB and the X-Ray service
1. In the `Configuration` tab of the lambda function, select the `Monitoring and operations tools`, click edit and enable `Active tracing` in the `AWS X-Ray` section
1. On the function's `Test` tab, create a test event with the following payload `{ "jokeID": "1" }` and click the `Test` button. You should see the joke loaded from the database in the response
1. On the `Monitor` tab, select the `Traces` menu option and inspect the service map as well as the individual traces. Click on one of the traces to get familiar of what info you have available, such as how long the request to query the DynamoDB took.
1. To call your function via HTTP, you must now provide a payload (you can find the gateway API URL in the `Configuration` tab under `Triggers`):
   ```shell
   curl -v -X POST <api-gateway-url> --data '{"jokeID":"1"}'
   ```

### Already done? Try some bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the `AWSUSER` and `ACCOUNT_ID` environment variables are still set.

   ```shell
   export AWSUSER=<your AWS user name>
   export ACCOUNT_ID=<your account ID>
   ```

1. Attach a policy for X-Ray access to your role

   ```shell
   aws iam attach-role-policy --role-name "lambda-exec-cli-${AWSUSER}" --policy-arn arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess
   ```

1. Create a policy for access to the "jokes" table in DynamoDB

   ```shell
   aws iam create-policy --policy-name "read-jokes-db-table-cli-${AWSUSER}" --policy-document '{ "Version": "2012-10-17", "Statement": [{ "Sid": "ReadWriteTable", "Effect": "Allow", "Action": [ "dynamodb:BatchGetItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan" ], "Resource": "arn:aws:dynamodb:eu-central-1:'${ACCOUNT_ID}':table/jokes" }]}'
   ```

1. Attach the policy to your role

   ```shell
   aws iam attach-role-policy --role-name "lambda-exec-cli-${AWSUSER}" --policy-arn "arn:aws:iam::${ACCOUNT_ID}:policy/read-jokes-db-table-cli-${AWSUSER}"
   ```

1. Create a deployment package for your new function:

   ```shell
   pushd level-2/function
   npm install
   zip -r function.zip ./*
   popd
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name "my-function-cli-${AWSUSER}" --zip-file fileb://level-2/function/function.zip
   ```

1. Switch on X-Ray tracing for your function

   ```shell
   aws lambda update-function-configuration --function-name "my-function-cli-${AWSUSER}" --tracing-config "Mode=Active"
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
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
   aws lambda update-function-configuration --function-name "my-function-tf-${TF_VAR_aws_user}" --tracing-config "Mode=Active"
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-tf-${TF_VAR_aws_user}" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
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
This means, aborting IO operations or long-running calculations when the function time runs out, or at least return to your program flow to handle the return values.
The AWS Lambda frameworks allow us to poll how much time is still left in a function call, which simplifies this.

Before you deploy the improved function to lambda, inspect the provided code in `level-3/function`.
You will notice the following points:

- The usage of `context.getRemainingTimeInMillis()` to receive from Lambda how much time is left in our function
- An additional grace period, we retain for our function in `TIMEOUT_GRACE_PERIOD_IN_MILLIS`
- That we trigger a promise, that rejects when the remaining time is below the grace period.

> Note!
>
> Some AWS resources support the usage of an [AbortController](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/interfaces/_aws_sdk_types.abortcontroller-1.html) to terminate those actions.
> When doing IO operations using resources that do not support it or doing long-running computations, make sure you set timeouts or implement a timeout check yourself.

### Steps

1. Inspect the provided code as described above
1. Click on `Functions` in the left navigation
1. Choose the function `my-function-AWSUSER`, which you created in level 0
1. In the `Configuration` tab of the function, select the `General configuration` menu and set the timeout to 1 second
1. Note that now only <20ms will be available for the DynamoDB query because our grace period is set to 980ms
1. Run `npm install` in the `function` folder
1. Create a zip file from the `function` folder and upload it to the function
1. On the functions `Test` tab, create a test event with the following payload `{ "jokeID": "1" }` and click the `Test` button.
   You should see the function returning successfully, but with a message, that it reached the timeout.
1. Set the timeout to 2 seconds and try again.
   This time, the function should be able to read the joke from the database and return it.

### Already done? Try some bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the `AWSUSER` and `ACCOUNT_ID` environment variables are still set.

   ```shell
   export AWSUSER=<your AWS user name>
   export ACCOUNT_ID=<your account ID>
   ```

1. Create a deployment package for your new function:

   ```shell
   pushd level-3/function
   npm install
   zip -r function.zip ./*
   popd
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name "my-function-cli-${AWSUSER}" --zip-file fileb://level-3/function/function.zip
   ```

1. Update the function's timeout setting to 1 second:

   ```shell
   aws lambda update-function-configuration --function-name "my-function-cli-${AWSUSER}" --timeout 1
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

1. Note that the function succeeds, but in the output tells you, that it ran into a timeout.

1. Update the function's timeout setting to 2 seconds:

   ```shell
   aws lambda update-function-configuration --function-name "my-function-cli-${AWSUSER}" --timeout 2
   ```

1. Invoke the function again with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

1. Note that the function succeeds and returns the joke.

</details>

<details>
  <summary>Still bored? Then try it with Terraform!</summary>

1. Make sure your work directory and user variables are still set

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Copy the Terraform module and the function code from level 3

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
   aws lambda invoke --function-name "my-function-tf-${TF_VAR_aws_user}" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

   Note that the function returns, but the response contains an error message because it ran into a timeout.

1. Change the timeout setting of the function in the terraform module in your working directory

1. Apply the Terraform module again

   ```shell
   terraform apply
   ```

1. Invoke the function with another test event:

   ```shell
   aws lambda invoke --function-name "my-function-tf-${TF_VAR_aws_user}" output.json --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' --log-type Tail --query 'LogResult' --output text |  base64 -d
   ```

   Note that the function returns successfully, and the response contains the joke loaded from the database.

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 4 - Optimized Cold Starts!

To reach level 4, you will need to reduce the cold start time of your function. Warmers are usually not recommended, but you can try moving initialization code outside your handler.

### Steps

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
1. Click on `Functions` in the left navigation
1. Choose the function `my-function-AWSUSER`, which you updated in level 3
1. Run `npm install` in the folder [level-4/function](https://github.com/bespinian/serverless-workshop/tree/main/level-4/function)
1. Create a zip file from the folder [level-4/function](https://github.com/bespinian/serverless-workshop/tree/main/level-4/function) and upload it to the function
1. Press the `Test` button and create a test event called `joke`
1. Paste the following JSON object to the editor field

   ```json
   {
     "jokeID": "1"
   }
   ```

1. Press the `Test` button again to run the test
1. Observe the test output

### Already done? Try some bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the `AWSUSER` and `ACCOUNT_ID` environment variables are still set.

   ```shell
   export AWSUSER=<your AWS user name>
   export ACCOUNT_ID=<your account ID>
   ```

1. Create a deployment package for your new function:

   ```shell
   pushd level-4/function
   npm install
   zip -r function.zip ./*
   popd
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name "my-function-cli-${AWSUSER}" --zip-file fileb://level-4/function/function.zip
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' output.json --log-type Tail
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
   aws lambda invoke --function-name "my-function-tf-${TF_VAR_aws_user}" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' output.json --log-type Tail
   ```

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 5 - Decouplin' it!

To reach level 5, you'll need to learn how to decouple multiple functions asynchronously via a message queue.

### Steps

1. Navigate to the level 5 code and install the dependencies:

   ```shell
   cd level-5/function
   npm install
   ```

1. Package your function

   ```shell
   zip -r function.zip ./*
   ```

1. In the Lambda GUI, create a new function called `sender-AWSUSER` (replace "AWSUSER" with your user name) and leave all the defaults
1. Create another function called `recipient-AWSUSER` (replace "AWSUSER" with your user name) and leave all the defaults
1. Upload `function.zip` to both functions and inspect the file. It defines and exports two different handlers. The first one sends an event to an SQS queue and the second one receives it.
1. Scroll down to `Runtime settings` and change the "Handler" to `index.senderHandler` for the sender function and to `index.recipientHandler` for the recipient function. For Node.js, the "index" part refers to the file name and the "handler" part to the name of the export. So, we can have multiple functions in the same source code.
1. Head over to the [SQS GUI](https://eu-central-1.console.aws.amazon.com/sqs/v2/home) and create a new queue called `messages-AWSUSER` replacing "AWSUSER" with your user name and leave all the defaults. Then copy the URL of your newly created queue to the clipboard. The URL can be found in the "Details" of the queue.
1. Set the `SQS_QUEUE_URL` environment variable to the name of the queue you have just created for the sender function
1. Give the sender function the permission to send messages to the queue by clicking its role name in the "Configuration" tab under "Permissions". Then attach the policy called `AmazonSQSFullAccess`.
1. Give the recipient function the permission to read messages from the queue by clicking its role name in the "Configuration" tab under "Permissions". Then attach the policy called `AWSLambdaSQSQueueExecutionRole`.
1. Go to the recipient's GUI and add a trigger by clicking the "Add trigger" button. Then choose "SQS" and choose your newly created queue.
1. Trigger your sender function with a test event
1. Head over to CloudWatch to examine the logs of the sender function. It has dispatched a message to the message queue.
1. Examine the logs of the recipient function. It has been asynchronously triggered by the sender function via the message queue.

### Already done? Try some bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the `AWSUSER` and `ACCOUNT_ID` environment variables are still set.

   ```shell
   export AWSUSER=<your AWS user name>
   ```

1. Create a deployment package for your new functions:

   ```shell
   cd level-5/function
   npm install
   zip -r function.zip ./*
   ```

1. Create two new roles:

   ```shell
   aws iam create-role --role-name "sender-exec-cli-${AWSUSER}" --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }] }'
   aws iam create-role --role-name "recipient-exec-cli-${AWSUSER}" --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }] }'

   ```

1. Create two new functions:

   ```shell
   export SENDER_ROLE_ARN=$(aws iam get-role --role-name "sender-exec-cli-${AWSUSER}" --query Role.Arn --output text)
   aws lambda create-function --function-name "sender-cli-${AWSUSER}" --zip-file fileb://function.zip --handler index.senderHandler --runtime nodejs18.x --role "$SENDER_ROLE_ARN"
   export RECIPIENT_ROLE_ARN=$(aws iam get-role --role-name "recipient-exec-cli-${AWSUSER}" --query Role.Arn --output text)
   aws lambda create-function --function-name "recipient-cli-${AWSUSER}" --zip-file fileb://function.zip --handler index.recipientHandler --runtime nodejs18.x --role "$RECIPIENT_ROLE_ARN"
   ```

1. Create a new message queue

   ```shell
   aws sqs create-queue --queue-name "messages-cli-${AWSUSER}"
   ```

1. Set the `SQS_QUEUE_URL` environment variable of the sender function to the queue's URL:

   ```shell
   export SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name "messages-cli-${AWSUSER}" --query QueueUrl --output text)
   aws lambda update-function-configuration --function-name "sender-cli-${AWSUSER}" --environment "Variables={SQS_QUEUE_URL='$SQS_QUEUE_URL'}"
   ```

1. Give your sender function the permission to log and to post messages to the queue:

   ```shell
   aws iam attach-role-policy --role-name "sender-exec-cli-${AWSUSER}" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   aws iam attach-role-policy --role-name "sender-exec-cli-${AWSUSER}" --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess
   ```

1. Give your recipient function the permission to log and read messages from the queue:

   ```shell
   aws iam attach-role-policy --role-name "recipient-exec-cli-${AWSUSER}" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   aws iam attach-role-policy --role-name "recipient-exec-cli-${AWSUSER}" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole
   ```

1. Set the SQS queue as a trigger for the recipient function:

   ```shell
   export SQS_QUEUE_ARN=$(aws sqs get-queue-attributes --queue-url "$SQS_QUEUE_URL" --attribute-names QueueArn --query Attributes.QueueArn --output text)
   aws lambda create-event-source-mapping --function-name "recipient-cli-${AWSUSER}" --event-source-arn "$SQS_QUEUE_ARN"
   ```

1. Invoke the sender function:

   ```shell
   aws lambda invoke --function-name "sender-cli-${AWSUSER}" output.json --log-type Tail
   ```

1. Check out the logs of the sender function to see that the message has been sent:

   ```shell
   aws logs tail "/aws/lambda/sender-cli-${AWSUSER}"
   ```

1. Check out the logs of the recipient function to see that it has been triggered, and the message has been received:

   ```shell
   aws logs tail "/aws/lambda/recipient-cli-${AWSUSER}"
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
   cp -r level-5/advanced/terraform/* my-tf-module
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
   aws lambda invoke --function-name "sender-tf-${TF_VAR_aws_user}" --cli-binary-format raw-in-base64-out output.json --log-type Tail
   ```

1. Check out the logs of the sender function to see that the message has been sent:

   ```shell
   aws logs tail "/aws/lambda/sender-tf-${TF_VAR_aws_user}"
   ```

1. Check out the logs of the recipient function to see that it has been triggered, and the message has been received:

   ```shell
   aws logs tail "/aws/lambda/recipient-tf-${TF_VAR_aws_user}"
   ```

1. Navigate back to the workshop repo

   ```shell
   popd
   ```

</details>

## Level 6 - Infra as Code

Infrastructure as code allows us to manage the deployments of our functions and other cloud resources in a much more repeatable and testable way, bringing us to the next level.

To deploy the function from level-4, and it's required resources, follow the steps below.
You can also use this to deploy it to your own AWS account with very few commands.

> Note!
>
> If you have done some extra work and already deployed the previous levels with Terraform, you may skip this level, as it redeploys the code from level 4.

### Prerequisites

For this step, need Terraform installed on your machine.
Follow the [Terraform installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli) and choose the installation method best suited for your operating system.

Furthermore, you need to have valid credentials for your AWS user set up in your terminal. You can test that by running the `aws sts get-caller-identity` command. You should see some basic information about your user. If that doesn't work, go back to the first "Already done? Try some bonus steps!" section in Level 0. There, in "Try it with the AWS CLI!", follow the "Installation" and "Authentication" instructions.

### Steps

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
   terraform -chdir=my-tf-module init
   ```

1. Set your AWS user name as an environment variable for Terraform

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Install the functions dependencies

   ```shell
   cd my-tf-module/function
   npm install
   cd ../..
   ```

1. Navigate to your Terraform module

   ```shell
   pushd my-tf-module
   ```

1. Apply the Terraform module

   ```shell
   terraform -chdir=my-tf-module apply
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-tf-${TF_VAR_aws_user}" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' output.json --log-type Tail
   ```

## Level 7 - Testing ... duh!

To reach level 7 you need to know how to

- Unit test your functions
- Run your functions locally to make debugging easier

### Steps

1. Navigate to the unit test example and install the dependencies:

   ```shell
   pushd level-7/unit-tests
   npm install
   ```

1. Inspect the example function, the service mocks and the tests:

   ```shell
   cat index.mjs
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
   cat api.mjs
   cat index.mjs
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

## Level 8 - Lockdown!

When you understand that functions can be assigned just the set of privileges that they need, you have reached level 8. To do so, you will observe an example of a function which is trying to write to the "jokes" table, but does not have permission to do so.

### Steps

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
1. Click on `Functions` in the left navigation
1. Choose the function `my-function-AWSUSER`, which you updated in level 4
1. Run `npm install` in the folder [level-8/function](https://github.com/bespinian/serverless-workshop/tree/main/level-8/function)
1. Create a zip file from the folder [level-8/function](https://github.com/bespinian/serverless-workshop/tree/main/level-8/function) and upload it to the function
1. Press the `Test` button and create a test event called `joke`
1. Paste the following JSON object to the editor field

   ```json
   {
     "jokeID": "1"
   }
   ```

1. Press the `Test` button again to run the test
1. Observe the failure in the test output. This is because your function has read only access to the "jokes" table, but is secretly trying to write to it.

### Already done? Try some bonus steps!

<details>
  <summary>Try it with the AWS CLI!</summary>

1. Make sure the `AWSUSER` and `ACCOUNT_ID` environment variables are still set.

   ```shell
   export AWSUSER=<your AWS user name>
   export ACCOUNT_ID=<your account ID>
   ```

1. Create a deployment package for your new function:

   ```shell
   pushd level-8/function
   npm install
   zip -r function.zip ./*
   popd
   ```

1. Update the function with the new code:

   ```shell
   aws lambda update-function-code --function-name "my-function-cli-${AWSUSER}" --zip-file fileb://level-8/function/function.zip
   ```

1. Invoke the function with a test event:

   ```shell
   aws lambda invoke --function-name "my-function-cli-${AWSUSER}" --cli-binary-format raw-in-base64-out --payload '{ "jokeID": "1" }' output.json --log-type Tail
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
   cp -r level-8/function my-tf-module
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

</details>

## Level 9 - Do the Canary

To reach level 9, we have to correctly deploy our app using a canary deployment. These can help greatly to reduce errors in production. In this section, you will do a rolling deployment that gradually increases the load to the new version and rolls back on errors. To do so, run through the following steps:

1. Go to the [AWS Lambda UI](https://console.aws.amazon.com/lambda)
1. Click on `Functions` in the left navigation
1. Choose the function `my-function-AWSUSER`, which you updated in level 4
1. Run `npm install` in the folder [level-9/function](https://github.com/bespinian/serverless-workshop/tree/main/level-9/function)
1. Create a zip file from the folder [level-9/function](https://github.com/bespinian/serverless-workshop/tree/main/level-9/function) and upload it to the function
1. Go to the "Versions" tab and click "Publish a new version", then click "Publish"
1. Click "Create alias" and call it "production"
1. Change something in the function code (e.g. add a `console.log("new version");` statement)
1. Zip the folder again and upload it
1. Publish another version with the new source code

Now, through a canary deployment, we want to migrate the `production` alias from version 1 to version 2.

1. To allow CodeDeploy to access our function, we need to create the respective role. Head over to the [IAM UI](https://console.aws.amazon.com/iamv2/home#/roles) and create a new role
1. Choose "CodeDeploy" as the service and then "CodeDeploy for Lambda" as the use case
1. Call the role `codedeploy-to-my-function-AWSUSER` (replacing "AWSUSER" with your user name)
1. Visit the [CodeDeploy UI](https://console.aws.amazon.com/codesuite/codedeploy/applications)
1. Create a new application and give it the same name as your function. Choose "AWS Lambda" as the "Compute platform"
1. Create a new deployment group and give it the same name as your function
1. For the "Service role", choose the one we have just created
1. The deployment configuration, should be set to "CodeDeployDefault.LambdaCanary10Percent5Minutes" to trigger a canary deployment which will roll out to another 10% of users every minute
1. Click "Create deployment" and choose "Use AppSpec editor" with "YAML"
1. Enter the following code into the text field (replacing `AWSUSER` with your user name):

   ```yml
   version: 0.0
   Resources:
     - my-function:
         Type: AWS::Lambda::Function
         Properties:
           Name: "my-function-AWSUSER"
           Alias: "production"
           CurrentVersion: "1"
           TargetVersion: "2"
   ```

1. Click "Create deployment"
1. You can now observe in real time how your `production` alias gets switched from version 1 to version 2 gradually using a canary deployment

### Already done? Try some bonus steps!

<details>
  <summary>Try it with Terraform!</summary>

1. Make sure your user variable is still set

   ```shell
   export TF_VAR_aws_user=<your AWS user name>
   ```

1. Navigate to the Terraform module

   ```shell
   cp level-9/advanced/terraform/* my-tf-module
   cp -r level-9/function my-tf-module
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

1. Change something about the function code and apply again to publish a new version (notice the `publish: true` flag in `function.tf`)
1. Visit the [CodeDeploy UI](https://console.aws.amazon.com/codesuite/codedeploy/applications)
1. Choose your application
1. Click "Create deployment" and choose "Use AppSpec editor" with "YAML"
1. Enter the following code into the text field (replacing `AWSUSER` with your user name):

   ```yml
   version: 0.0
   Resources:
     - my-function:
         Type: AWS::Lambda::Function
         Properties:
           Name: "my-function-tf-AWSUSER"
           Alias: "production"
           CurrentVersion: "1"
           TargetVersion: "2"
   ```

1. Click "Create deployment"
1. You can now observe in real time how your `production` alias gets switched from version 1 to version 2 gradually using a canary deployment

</details>
