import { Request, Response } from "express";
import { GraphDao } from "../db/dao/graphDao.js";
import { ApiSuccessResponse } from "../services/apiResponse/successResponse.js";
import { GraphValidationService } from "../services/validation/GraphValidationService.js";
import {
  createPathFromUrl,
  deleteFromFs,
  generateFileUrl,
  generateUniquefileName,
  uploadFile,
} from "../middleware/fileStorage.js";
import { publicDirname, serverDirname } from "../constants.js";
import path from "path";

const handleGetSavedGraphs = async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const data = new GraphValidationService().validateGetSavedGraphs(page, limit);

  if (!data) {
    res.sendStatus(400);
    return;
  }

  const graphDao = new GraphDao();
  const savedGraphs = await graphDao.getSavedGraphs(
    req.session.user!.id,
    data.page,
    data.limit
  );

  res.status(200).json(new ApiSuccessResponse().createResponse(savedGraphs));
  return;
};

const handlePutSavedGraphs = async (req: Request, res: Response) => {
  if (!req.file) res.sendStatus(400);

  const fileName = generateUniquefileName(req.file!, req);

  req.body.image = generateFileUrl(fileName);
  req.body.graph_snapshot = JSON.parse(req.body.graph_snapshot);
  req.body.items = JSON.parse(req.body.items);

  const data = new GraphValidationService().validateGraph(req.body);
  if (!data) {
    res.sendStatus(400);
    return;
  }

  const graphDao = new GraphDao();
  const isSuccess = await graphDao.putSavedGraph(req.session.user!.id, data);
  if (!isSuccess) {
    res.sendStatus(500);
    return;
  }

  uploadFile(req.file!.buffer, fileName);
  if (req.body.prevImage) {
    deleteFromFs(
      createPathFromUrl(
        [req.body.prevImage],
        path.join(publicDirname, "/images")
      )[0]
    ).catch(console.error);
  }

  res.status(200).send(new ApiSuccessResponse().createResponse(data.image));
  return;
};

const handelDeleteSavedGraph = async (req: Request, res: Response) => {
  const { graphId } = req.body;
  if (typeof graphId !== "string") {
    res.sendStatus(400);
    return;
  }

  const graphDao = new GraphDao();
  const image = await graphDao.deleteSavedGraph(req.session.user!.id, graphId);

  if (!image) {
    res.sendStatus(400);
    return;
  }

  deleteFromFs(
    createPathFromUrl([image], path.join(publicDirname, "/images"))[0]
  );
  res.sendStatus(200);
  return;
};

export default {
  handleGetSavedGraphs,
  handlePutSavedGraphs,
  handelDeleteSavedGraph,
};
