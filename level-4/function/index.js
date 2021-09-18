const AWSXRay = require("aws-xray-sdk-core");
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

// share the db connection between invocations
const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

exports.handler = async (event) => {
  const tableSuffix = process.env.JOKE_TABLE_SUFFIX
    ? process.env.JOKE_TABLE_SUFFIX
    : "";
  const params = {
    TableName: "Jokes" + tableSuffix,
    Key: { ID: { N: event.jokeID } },
  };

  const response = await ddb.send(new GetItemCommand(params));
  return response.Item;
};
