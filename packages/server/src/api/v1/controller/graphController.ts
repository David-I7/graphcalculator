import { Request, Response } from "express";
import exampleGraphs from "../db/data/examples.json" with { type: "json" };
import { GraphDao } from "../db/dao/graphDao.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { GraphValidationService } from "../services/validation/GraphValidationService.js";
import { deleteFromFs } from "../middleware/fileStorage.js";
import { inspect } from "node:util";

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


  const graphDao = new GraphDao();
  const savedGraphs = await graphDao.getSavedGraphs(req.session.user!.id,data.page,data.limit)

    res.status(200).json(new ApiSuccessResponse().createResponse(savedGraphs))
   return
}

const handlePutSavedGraphs = async (req: Request, res: Response) => {
  if (!req.file) res.sendStatus(400)

  req.body.image = process.env.SERVER_ORIGIN!.concat("/public/images/",req.file!.filename)
  req.body.graph_snapshot = JSON.parse(req.body.graph_snapshot)
  req.body.items = JSON.parse(req.body.items)

  const data = new GraphValidationService().validateGraph(req.body)
  if (!data) {
    deleteFromFs(req.file!.filename,req.file!.destination)
    res.sendStatus(400)
    return
  }

  const graphDao = new GraphDao()
  
  const isSuccess = await graphDao.putSavedGraph(req.session.user!.id,data)
  if (!isSuccess) {
    res.sendStatus(500)
    return;
  }
  deleteFromFs(req.body.prevImage,req.file!.destination)

  res.status(200).send(new ApiSuccessResponse().createResponse(data.image))
  return 
}

export default { handleExampleGraphs,handleGetSavedGraphs,handlePutSavedGraphs };
