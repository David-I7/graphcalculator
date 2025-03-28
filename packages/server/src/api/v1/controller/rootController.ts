import path from "path";
import { clientDirname } from "../constants.js";

const rootController = (req, res) => {
  res.sendFile(path.join(clientDirname, "index.html"));
};

export default rootController;
