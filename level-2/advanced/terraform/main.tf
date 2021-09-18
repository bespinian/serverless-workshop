terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.48.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }

  required_version = "~> 1.0"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_dynamodb_table_item" "joke-1" {
  table_name = aws_dynamodb_table.jokes.name
  hash_key   = aws_dynamodb_table.jokes.hash_key

  item = <<ITEM
{
  "ID": {"N": "1"},
  "Text": {"S": "A biologist, a chemist and a statistician are out hunting, The biologist shoots at a deer and misses five feet to the left. The chemist shoots at the same deer and misses five feet to the right. The statistician shouts, 'We got him!'"}
}
ITEM
}

resource "aws_dynamodb_table" "jokes" {
  name           = "Jokes-${var.aws_user}"
  read_capacity  = 10
  write_capacity = 10
  hash_key       = "ID"

  attribute {
    name = "ID"
    type = "N"
  }
}

data "archive_file" "my_function" {
  type = "zip"

  source_dir  = "${path.module}/function"
  output_path = "${path.module}/function.zip"
}

resource "aws_lambda_function" "my_function" {
  function_name = "my-function-tf-${var.aws_user}"

  filename = data.archive_file.my_function.output_path

  runtime = "nodejs14.x"
  handler = "index.handler"

  environment {
    variables = {
      JOKE_TABLE_SUFFIX = "-${var.aws_user}"
    }
  }

  tracing_config {
    mode = "Active"
  }
  source_code_hash = data.archive_file.my_function.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "my_function" {
  name = "/aws/lambda/${aws_lambda_function.my_function.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless-lambda-tf-${var.aws_user}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "function_tracing_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = data.aws_iam_policy.xray_write_access.arn
}

data "aws_iam_policy" "xray_write_access" {
  name = "AWSXrayWriteOnlyAccess"
}

resource "aws_iam_policy" "read_jokes_db_table" {
  name   = "read-jokes-db-table-tf-${var.aws_user}"
  policy = data.aws_iam_policy_document.access_jokes_table.json
}

data "aws_iam_policy_document" "access_jokes_table" {
  statement {
    sid    = "ReadWriteTable"
    effect = "Allow"
    actions = [
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:BatchGetItem",
      "dynamodb:GetItem",
    ]
    resources = [aws_dynamodb_table.jokes.arn]
  }
}

resource "aws_iam_role_policy_attachment" "dynamodb_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.read_jokes_db_table.arn
}
