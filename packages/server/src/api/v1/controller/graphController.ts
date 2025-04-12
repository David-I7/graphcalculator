import { Request, Response } from "express";
import exampleGraphs from "../db/data/examples.json" with { type: "json" };
import { UserDao } from "../db/dao/userDao.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { GraphValidationService } from "../services/validation/GraphValidationService.js";

const handleExampleGraphs = (req: Request, res: Response) => {
  res.status(200).json(new ApiSuccessResponse().createResponse(exampleGraphs));
};

const handleGetSavedGraphs = async (req: Request, res: Response) => {
  const {page,limit} = req.query

  const data = new GraphValidationService().validateGetSavedGraphs(page,limit) 

  if (!data) {
    res.sendStatus(400)
    return
  } 


  const userDao = new UserDao();
  const savedGraphs = await userDao.getSavedGraphs(req.session.user!.id,data.page,data.limit)

    res.status(200).json(new ApiSuccessResponse().createResponse(savedGraphs))
   return
}

export default { handleExampleGraphs,handleGetSavedGraphs };
