import express from "express";
import path from "node:path";

const app = express();

app.get("/", (req, res) => {
  console.log(import.meta.url);
  res.send("x");
});

app.listen(process.env.port || 8080, () => {
  console.log(`App listening on port ${process.env.port || 8080}`);
});
