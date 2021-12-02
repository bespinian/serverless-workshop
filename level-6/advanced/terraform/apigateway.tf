resource "aws_apigatewayv2_api" "main" {
  name             = "my-api-gw-tf-${var.aws_user}"
  description      = "The API Gateway for ${var.aws_user}"
  protocol_type    = "HTTP"
  fail_on_warnings = true
}

resource "aws_apigatewayv2_route" "root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.root.id}"
}

resource "aws_apigatewayv2_integration" "root" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  payload_format_version = "2.0"
  integration_uri        = aws_lambda_function.my_function.arn
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "main" {
  statement_id  = "allow-invocation-by-api-gateway"
  principal     = "apigateway.amazonaws.com"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.my_function.function_name
  source_arn    = "${aws_apigatewayv2_stage.main.execution_arn}/$default"
}
