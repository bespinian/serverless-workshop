const AWSXRay = require("aws-xray-sdk");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

const ddb = new AWS.DynamoDB();

exports.handler = async (event) => {
  const params = {
    TableName: "Jokes-gk",
    Key: { ID: { N: event.jokeID } },
  };

  const response = await ddb.getItem(params).promise();
  return response.Item;
};
