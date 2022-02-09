exports.handler = async (event, context, callback) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: `Hello, I am ${process.env.NAME}`,
    isBase64Encoded: false,
  };
};
