export const handler = async (event) => {
  console.log(`${event.name} invoked me`);
  console.error("Oh noes!");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: `Hello ${event.name}`,
    isBase64Encoded: false,
  };
};
