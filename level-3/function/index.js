const AWSXRay = require("aws-xray-sdk-core");
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const TIMEOUT_GRACE_PERIOD_IN_MILLIS = 980;

exports.handler = async (event, context) => {
  const ddb = AWSXRay.captureAWSv3Client(new DynamoDBClient());

  const tableSuffix = process.env.JOKE_TABLE_SUFFIX
    ? process.env.JOKE_TABLE_SUFFIX
    : "";
  const params = {
    TableName: "Jokes" + tableSuffix,
    Key: { ID: { N: event.jokeID } },
  };

  // Abort before function times out.
  const timoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Timeout")),
      context.getRemainingTimeInMillis() - TIMEOUT_GRACE_PERIOD_IN_MILLIS
    )
  );

  responsePromise = ddb.send(new GetItemCommand(params));

  try {
    response = await Promise.race([timoutPromise, responsePromise]);
    console.log(
      `Remaining time after db query is ${context.getRemainingTimeInMillis()}ms.`
    );

    return {
      joke: response.Item.Text.S,
    };
  } catch (e) {
    if (e.message == "Timeout") {
      return {
        error: `Query failed to complete within given time. Time remaining: ${context.getRemainingTimeInMillis()}ms.`,
      };
    }
    throw e;
  }
};
