const AWSXRay = require("aws-xray-sdk");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

const ddb = new AWS.DynamoDB();

exports.handler = async (event) => {
  const tableSuffix = process.env.JOKE_TABLE_SUFFIX
    ? process.env.JOKE_TABLE_SUFFIX
    : "";
  const params = {
    TableName: "Jokes" + tableSuffix,
    Key: { ID: { N: event.jokeID } },
  };

  const response = await ddb.getItem(params).promise();
  return response.Item;
};
