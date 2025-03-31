import { Router } from "express";
import { DB } from "../db/index.js";

const testRouter = Router();

testRouter.get("/", async (re1, res) => {
  try {
    const qRes = await DB.query("select * from users");
    console.log(qRes);
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ statusCode: "okk" });
});

export default testRouter;
