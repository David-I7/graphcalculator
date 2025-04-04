import { Router } from "express";
import { DB } from "../db/index.js";

const testRouter = Router();

testRouter.get("/", async (req, res) => {
  console.log(req.session);
  console.log(req.session.cookie.maxAge);
  const prevUser = req.session.user;
  req.session.regenerate((err) => {
    req.session.user = prevUser;
    res.status(200).json({ statusCode: "okk" });
  });
});

export default testRouter;
