const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsQueueURL = process.env.SQS_QUEUE_URL;

const sqs = new SQSClient({ region: "eu-central-1" });

export const senderHandler = async () => {
  const cmd = new SendMessageCommand({
    MessageBody: "Hello from sender function",
    QueueUrl: sqsQueueURL,
  });

  try {
    const res = await sqs.send(cmd);
    console.log(`Message ${res.MessageId} sent`);
  } catch (err) {
    console.error("Error sending SQS message:", err);
  }
};

export const recipientHandler = async (event) => {
  event.Records.forEach((record) => {
    console.log(`Message ${record.messageId} received: ${record.body}`);
  });
};
