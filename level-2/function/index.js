const AWSXRay = require("aws-xray-sdk-core");
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

exports.handler = async (event) => {
  const tableSuffix = process.env.JOKE_TABLE_SUFFIX
    ? process.env.JOKE_TABLE_SUFFIX
    : "";

  const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

  const cmd = new GetItemCommand({
    TableName: `Jokes${tableSuffix}`,
    Key: { ID: { N: event.jokeID } },
  });

  const response = await ddb.send(cmd);
  return response.Item;
};
