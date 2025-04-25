import { Router } from "express";

const testRouter = Router();

testRouter.get("/", async (req, res) => {
  await new Promise((res, rej) => {
    setTimeout(res, 60000 * 3);
  });

  res.sendStatus(200);
});

export default testRouter;
