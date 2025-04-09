import { Router } from "express";

const testRouter = Router();

testRouter.get("/", async (req, res) => {
  console.log(req.session);
  res.sendStatus(200);
});

export default testRouter;
