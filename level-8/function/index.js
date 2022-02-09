const AWSXRay = require("aws-xray-sdk-core");
const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");

const tableSuffix = process.env.JOKE_TABLE_SUFFIX
  ? process.env.JOKE_TABLE_SUFFIX
  : "";

// share the db connection between invocations
const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

exports.handler = async (event) => {
  // this should work
  const getItemCmd = new GetItemCommand({
    TableName: `jokes${tableSuffix}`,
    Key: { ID: { N: event.jokeID } },
  });
  const readResponse = await ddb.send(getItemCmd);
  console.log("Successfully read a funny joke from jokes database ...");

  // this should not work due to fine grained access control (and because this joke is just too corny!)
  const putItemCmd = new PutItemCommand({
    TableName: `Jokes${tableSuffix}`,
    Item: {
      ID: { N: "2" },
      Text: {
        S: "Why did the bike fall over? It was two tired (Ba, dum, tssss!)",
      },
    },
  });
  console.log("... now trying to insert a corny joke into the database!");
  await ddb.send(putItemCmd);

  return readResponse.Item;
};
