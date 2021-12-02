const AWSXRay = require("aws-xray-sdk-core");
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

exports.handler = async (event) => {
  const tableSuffix = process.env.JOKE_TABLE_SUFFIX
    ? process.env.JOKE_TABLE_SUFFIX
    : "";

  const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

  let jokeID = event.jokeID;
  if (event.body) {
    const buff = Buffer.from(event.body, "base64");
    const body = JSON.parse(buff.toString("utf-8"));

    jokeID = body.jokeID;
  }
  const cmd = new GetItemCommand({
    TableName: `jokes${tableSuffix}`,
    Key: { ID: { N: jokeID } },
  });

  const response = await ddb.send(cmd);

  return response.Item;
};
