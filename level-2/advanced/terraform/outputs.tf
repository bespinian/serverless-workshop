output "function_name" {
  description = "Name of the Lambda function."

  value = aws_lambda_function.my_function.function_name
}

output "table_name" {
  description = "Name of the DynamoDB table"

  value = aws_dynamodb_table.jokes.name
}
