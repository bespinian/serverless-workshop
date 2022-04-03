const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  const tableSuffix = process.env.JOKE_TABLE_SUFFIX
    ? process.env.JOKE_TABLE_SUFFIX
    : "";

  const cmd = new GetItemCommand({
    TableName: `jokes${tableSuffix}`,
    Key: { ID: { N: event.jokeID } },
  });
  const response = await ddb.send(cmd);

  return response.Item;
};
