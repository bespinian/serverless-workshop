const AWSXRay = require("aws-xray-sdk-core");
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

exports.handler = async (event, context) => {
  const TIMEOUT_GRACE_PERIOD_IN_MILLIS = 980;

  const tableSuffix = process.env.JOKE_TABLE_SUFFIX
    ? process.env.JOKE_TABLE_SUFFIX
    : "";

  const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

  // Abort before function times out
  const timoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Timeout")),
      context.getRemainingTimeInMillis() - TIMEOUT_GRACE_PERIOD_IN_MILLIS
    )
  );

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

  responsePromise = ddb.send(cmd);

  try {
    response = await Promise.race([timoutPromise, responsePromise]);
    console.log(
      `Remaining time after db query is ${context.getRemainingTimeInMillis()}ms.`
    );

    return response.Item;
  } catch (err) {
    if (err.message == "Timeout") {
      return {
        error: `Query failed to complete within given time. Time remaining: ${context.getRemainingTimeInMillis()}ms.`,
      };
    }
    throw err;
  }
};
