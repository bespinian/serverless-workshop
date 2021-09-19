const serverless = require("serverless-http");
const app = require("./api.js").app;

exports.handler = serverless(app);
