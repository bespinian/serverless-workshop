import AWSXRay from "aws-xray-sdk-core";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const tableSuffix = process.env.JOKE_TABLE_SUFFIX
  ? process.env.JOKE_TABLE_SUFFIX
  : "";

// share the db connection between invocations
const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

export const handler = async (event) => {
  const cmd = new GetItemCommand({
    TableName: `jokes${tableSuffix}`,
    Key: { ID: { N: event.jokeID } },
  });
  const response = await ddb.send(cmd);

  return response.Item;
};
