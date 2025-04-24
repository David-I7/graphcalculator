import { Request, Response } from "express";
import exampleGraphs from "../../../../public/examples.json" with { type: "json" };
import { GraphDao } from "../db/dao/graphDao.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { GraphValidationService } from "../services/validation/GraphValidationService.js";
import { createPathFromUrl, deleteFromFs } from "../middleware/fileStorage.js";
import { publicDirname } from "../constants.js";
import path from "path";

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
    
    deleteFromFs(createPathFromUrl([req.file!.filename],req.file!.destination)[0])
    res.sendStatus(400)
    return
  }

  const graphDao = new GraphDao()
  
  const isSuccess = await graphDao.putSavedGraph(req.session.user!.id,data)
  if (!isSuccess) {
    res.sendStatus(500)
    return;
  }

  if (req.body.prevImage){
  deleteFromFs(
    createPathFromUrl([req.body.prevImage],req.file!.destination)[0])
  }
    

  res.status(200).send(new ApiSuccessResponse().createResponse(data.image))
  return 
}

const handelDeleteSavedGraph = async (req:Request,res:Response)=>{
  const {graphId} = req.body
  if (typeof graphId !== "string") {
    res.sendStatus(400)
    return
  }

  const graphDao = new GraphDao()
  const image = await graphDao.deleteSavedGraph(graphId)
  
  if (!image){
    res.sendStatus(400)
    return
  }

  deleteFromFs(createPathFromUrl([image],path.join(publicDirname,"/images"))[0])
  res.sendStatus(200)
  return
}

export default { handleExampleGraphs,handleGetSavedGraphs,handlePutSavedGraphs,handelDeleteSavedGraph };
