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
  "text": {"S": "A biologist, a chemist and a statistician are out hunting, The biologist shoots at a deer and misses five feet to the left. The chemist shoots at the same deer and misses five feet to the right. The statistician shouts, 'We got him!'"}
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
