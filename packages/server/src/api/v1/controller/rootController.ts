import path from "path";
import { clientDirname } from "../constants.js";

const handleGetRoot = (req, res) => {
  res.sendFile(path.join(clientDirname, "index.html"));
};

export default handleGetRoot;
