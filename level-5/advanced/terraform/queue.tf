resource "aws_sqs_queue" "messages" {
  name = "messages-tf-${var.aws_user}"
}

resource "aws_lambda_event_source_mapping" "messages" {
  event_source_arn = aws_sqs_queue.messages.arn
  function_name    = aws_lambda_function.recipient.arn
}
