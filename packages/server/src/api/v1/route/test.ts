import { Request, Response, Router } from "express";
import { JWTService } from "../services/jwt/jwtService.js";

const testRouter = Router();

testRouter.get("/", async (req, res) => {
  await new Promise((res, rej) => {
    setTimeout(res, 60000 * 3);
  });

  res.sendStatus(200);
});

testRouter.get("/sign", async (req, res) => {
  const token = await new JWTService().sign(
    { hello: "world" },
    { expiresIn: "60s" }
  );
  res.json({ token });
});

testRouter.post(
  "/verify",
  new JWTService().verify(),
  (req: Request, res: Response) => {
    console.log(req.jwtPayload);
    res.sendStatus(200);
  }
);

export default testRouter;
