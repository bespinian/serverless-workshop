exports.handler = async (event) => {
  console.log(`${event.name} invoked me`);
  console.error("Oh noes!");
  return `Hello ${event.name}`;
};
