import { Router } from "express";
import { cookieOptions } from "../config/cookies.js";

const testRouter = Router();

testRouter.get("/", async (req, res) => {
  console.log(req.session);
});

export default testRouter;
