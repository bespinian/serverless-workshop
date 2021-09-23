resource "aws_lambda_function" "sender" {
  function_name = "sender-tf-${var.aws_user}"

  filename = data.archive_file.functions.output_path

  runtime = "nodejs14.x"
  handler = "index.handler"

  tracing_config {
    mode = "Active"
  }
  source_code_hash = data.archive_file.functions.output_base64sha256

  role = aws_iam_role.sender_exec.arn
}

resource "aws_cloudwatch_log_group" "sender_function" {
  name = "/aws/lambda/${aws_lambda_function.sender.function_name}"

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
  policy_arn = data.aws_iam_policy.sender_xray_write_access.arn
}

data "aws_iam_policy" "sender_xray_write_access" {
  name = "AWSXrayWriteOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "sender_read_from_queue" {
  role       = aws_iam_role.sender_exec.name
  policy_arn = data.aws_iam_policy.write_messages.arn
}

data "aws_iam_policy" "write_messages" {
  name = "AmazonSQSFullAccess"
}
