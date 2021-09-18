const AWSXRay = require("aws-xray-sdk");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

const TIMEOUT_GRACE_PERIOD_IN_MILLIS = 980;

const ddb = new AWS.DynamoDB();

exports.handler = async (event, context) => {
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

  responsePromise = ddb.getItem(params).promise();

  try {
    response = await Promise.race([timoutPromise, responsePromise]);
    console.log(
      `Remaining time after db query is ${context.getRemainingTimeInMillis()}ms.`
    );

    return {
      joke: response.Item.text.S,
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
