import serverless from "serverless-http";
import { app } from "./api.mjs";

export const handler = serverless(app);
