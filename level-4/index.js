import axios from "axios";

const TIMEOUT_GRACE_PERIOD_IN_MILLIS = 500;

exports.handler = async (event, context) => {
  const response = await axios.get("https://bespinian.io", {
    timeout:
      context.getRemainingTimeInMillis() - TIMEOUT_GRACE_PERIOD_IN_MILLIS,
  });

  return response.data;
};
