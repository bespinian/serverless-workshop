import AWSXRay from "aws-xray-sdk-core";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const tableSuffix = process.env.JOKE_TABLE_SUFFIX
  ? process.env.JOKE_TABLE_SUFFIX
  : "";

// share the db connection between invocations
const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

export const handler = async (event) => {
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
