import express from "express";
import bodyParser from "body-parser";

export const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  const name = req.body.name;
  console.log(`${name} invoked me`);
  console.error("Oh noes!");
  res.send(`Hello ${name}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
