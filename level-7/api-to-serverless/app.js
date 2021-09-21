const express = require("express");

const port = 3000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  const name = req.body.name || JSON.parse(req.body).name; // hack to make this work with AWS lambda test events
  console.log(`${name} invoked me`);
  console.error("Oh noes!");
  res.send(`Hello ${name}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
