resource "aws_lambda_function" "sender" {
  function_name = "sender-tf-${var.aws_user}"

  filename = data.archive_file.my_function.output_path

  runtime = "nodejs14.x"
  handler = "index.handler"

  tracing_config {
    mode = "Active"
  }
  source_code_hash = data.archive_file.my_function.output_base64sha256

  role = aws_iam_role.sender_exec.arn
}

data "archive_file" "my_function" {
  type = "zip"

  source_dir  = "${path.module}/function"
  output_path = "${path.module}/function.zip"
}

resource "aws_cloudwatch_log_group" "my_function" {
  name = "/aws/lambda/${aws_lambda_function.my_function.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "sender_exec" {
  name = "sender-exec-tf-${var.aws_user}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "sender_basic_exec" {
  role       = aws_iam_role.sender_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "sender_tracing_execution" {
  role       = aws_iam_role.sender_exec.name
  policy_arn = data.aws_iam_policy.xray_write_access.arn
}

data "aws_iam_policy" "xray_write_access" {
  name = "AWSXrayWriteOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "sender_read_from_queue" {
  role       = aws_iam_role.sender_exec.name
  policy_arn = data.aws_iam_policy.write_messages.arn
}

data "aws_iam_policy" "write_messages" {
  name = "AmazonSQSFullAccess"
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
  role       = aws_iam_role.sender_exec.name
  policy_arn = aws_iam_policy.read_jokes_db_table.arn
}
