exports.handler = async (event, context, callback) => {
  return {
    statusCode: 200,
    body: `Hello, I am ${process.env.NAME}`,
    headers: {
      "Content-Type": "text/plain",
    },
    multiValueHeader: {},
    isBase64Encoded: false,
  };
};
