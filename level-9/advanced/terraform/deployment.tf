resource "aws_codedeploy_app" "main" {
  name             = aws_lambda_function.my_function.function_name
  compute_platform = "Lambda"
}

resource "aws_codedeploy_deployment_group" "main" {
  deployment_group_name  = aws_codedeploy_app.main.name
  app_name               = aws_codedeploy_app.main.name
  deployment_config_name = "CodeDeployDefault.LambdaCanary10Percent5Minutes"

  deployment_style {
    deployment_type   = "BLUE_GREEN"
    deployment_option = "WITH_TRAFFIC_CONTROL"
  }

  service_role_arn = aws_iam_role.codedeploy_deploy_lambda.arn
}

resource "aws_iam_role" "codedeploy_deploy_lambda" {
  name               = "my-codedeploy-deploy-lambda-tf-${var.aws_user}"
  assume_role_policy = data.aws_iam_policy_document.codedeploy_deploy_lambda.json
}

data "aws_iam_policy_document" "codedeploy_deploy_lambda" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["codedeploy.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy_attachment" "codedeploy_deploy_lambda" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRoleForLambda"
  role       = aws_iam_role.codedeploy_deploy_lambda.name
}
