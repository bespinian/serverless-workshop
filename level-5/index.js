const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({ region: "eu-central-1" });

exports.handler = async (event) => {
  const params = {
    MessageBody: `Received event: ${JSON.stringify(event)}`,
    QueueUrl: "SQS_QUEUE_URL",
  };

  sqs.send(new SendMessageCommand(params), (err, data) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
};
