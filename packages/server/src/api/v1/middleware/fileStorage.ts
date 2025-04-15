import multer from "multer";
import { publicDirname } from "../constants.js";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, publicDirname.concat("/images"));
  },
  filename(req, file, callback) {
    const ext = file.mimetype.split("/")[1];
    const name = req.session
      .user!.id.slice(0, 8)
      .concat(new Date().getTime().toString(), ".", ext);
    callback(null, name);
  },
});
const upload = multer({ storage });

export default upload;
