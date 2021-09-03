const AWSXRay = require("aws-xray-sdk");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

const TIMEOUT_GRACE_PERIOD_IN_MILLIS = 500;

const ddb = new AWS.DynamoDB();

exports.handler = async (event, context) => {
  AWS.config.update({
    httpOptions: {
      timeout:
        context.getRemainingTimeInMillis() - TIMEOUT_GRACE_PERIOD_IN_MILLIS,
    },
  });

  const params = {
    TableName: "Jokes",
    Key: { ID: { S: event.jokeID } },
  };

  const response = await ddb.getItem(params).promise();
  return response.Item;
};
