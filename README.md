# serverless-workshop

A workshop on Serverless

## Preparation

Before the course, please take care of the following tasks.

### Test your AWS login

You have received an AWS Account ID, a user name and a password from the trainers. Please navigate to `https://aws.amazon.com/`, click the button `Sign In to the Console` and enter your credentials. You should be able to log in to the console. From there you should be able to reach the service `Lambda`.

### Optional: install the AWS CLI

#### Installation

If you want to also work on some of the optional extra topics of this course, you need to install the AWS CLI on your machine. Please follow the [AWS CLI installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and choose the installation method best suited for your operating system.

#### Authentication

In order to authenticate your CLI you need to first create an access key by performing the following steps:

1. Log in to the AWS Console with your credentials
2. Click on your name in the top right of the screen
3. Click `My Security Credentials` in the dropdown
4. Click `Create Access Key` under `Access keys for CLI, SDK, & API access`
5. Download the access key ID and the secret access key as a CSV file or copy them

Then you need to configure your CLI with access key ID and the secret access key

6. Type `aws configure` in your terminal
7. Enter your access key ID and the secret access key at the prompts
8. Supply a default region name and a default output format
9. Test the connection by typing `aws sts get-caller-identity` in your terminal. You should see some basic information about your user.

### Optional: install Terraform

Some optional extra topics also require Terraform, which you need to install on your machine. Please follow the [Terraform installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli) and choose the installation method best suited for your operating system.

## Level 0 - This is easy!

- Func configured via env variables
- Play with scaling
- Figure out everything is deny by default

### Steps

1. Go to AWS Lambda GUI
1. Create function
1. Paste code
1. Set environment variable `NAME`
1. Test function

## Level 1 - Loggin' it!

- Logging
- Event parameter
- Permissions

### Steps

1. Paste code
1. Verify permissions
1. Test function
1. Check logs in CloudWatch

## Level 2 - Tracin' it!

### Steps

1. Paste code
1. Grant DynamoDB permission to function
1. Grant XRay permission to function
1. Test function
1. Check tracing in XRay

## Level 3 - Timin' it!

### Steps

1. Paste code

## Level 4 - No cold starts!

### Steps
