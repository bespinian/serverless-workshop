import AWS from "aws-sdk";

AWS.config.update({ region: "eu-central-1" });

const sqs = new AWS.SQS();

exports.handler = async (event) => {
  const params = {
    MessageBody: `Received event: ${JSON.stringify(event)}`,
    QueueUrl: "SQS_QUEUE_URL",
  };

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
};
