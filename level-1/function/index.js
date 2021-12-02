exports.handler = async (event) => {
  console.log(`${event.name} invoked me`);
  console.error("Oh noes!");
  return {
    statusCode: 200,
    body: `Hello ${event.name}`,
    headers: {
      "Content-Type": "text/plain",
    },
    multiValueHeader: {},
    isBase64Encoded: false,
  };
};
