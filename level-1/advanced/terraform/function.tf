resource "aws_lambda_function" "my_function" {
  function_name = "my-function-logged-tf-${var.aws_user}"

  filename = "${path.module}/function.zip"

  runtime = "nodejs22.x"
  handler = "index.handler"

  source_code_hash = data.archive_file.my_function.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
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

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-exec-tf-${var.aws_user}"

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

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
