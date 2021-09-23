resource "aws_dynamodb_table" "jokes" {
  name           = "Jokes-${var.aws_user}"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "ID"

  attribute {
    name = "ID"
    type = "N"
  }
}

resource "aws_dynamodb_table_item" "joke_1" {
  table_name = aws_dynamodb_table.jokes.name
  hash_key   = aws_dynamodb_table.jokes.hash_key

  item = <<ITEM
{
  "ID": {"N": "1"},
  "Text": {"S": "A biologist, a chemist and a statistician are out hunting, The biologist shoots at a deer and misses five feet to the left. The chemist shoots at the same deer and misses five feet to the right. The statistician shouts, 'We got him!'"}
}
ITEM
}
