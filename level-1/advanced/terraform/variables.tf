variable "aws_user" {
  description = "The AWS user name used to disambiguate resource names"
  type        = string
}

variable "aws_region" {
  description = "AWS region for all resources"
  default     = "eu-central-1"
}
