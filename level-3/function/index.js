const AWSXRay = require("aws-xray-sdk");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

const TIMEOUT_GRACE_PERIOD_IN_MILLIS = 1000;

const ddb = new AWS.DynamoDB();

exports.handler = async (event, context) => {
  AWS.config.update({
    httpOptions: {
      timeout:
        context.getRemainingTimeInMillis() - TIMEOUT_GRACE_PERIOD_IN_MILLIS,
    },
  });

  const params = {
    TableName: "Jokes-gk",
    Key: { ID: { N: event.jokeID } },
  };

  const response = await ddb.getItem(params).promise();
  return response.Item;
};
