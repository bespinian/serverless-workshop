import express from "express";

export const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const name = req.query.name;
  console.log(`${name} invoked me`);
  res.send(`Hello ${name}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
