import serverless from "serverless-http";
import { app } from "./api.js";

export const handler = serverless(app, {
  request(request, event, context) {
    if (event.body && event.body.length > 0) {
      request.body = JSON.parse(event.body); // request coming in via api gateway
      request.url = "/";
    } else {
      request.body = event; // request coming in via lambda test
    }
  },
});
