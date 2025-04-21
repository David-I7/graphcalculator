import multer from "multer";
import { publicDirname } from "../constants.js";
import fs from "node:fs";
import path from "node:path";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.join(publicDirname, "/images"));
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

export function deleteFromFs(image: string, destination: string) {
  if (!image || !destination) {
    return;
  }

  const filepath = path.join(destination, `/${path.basename(image)}`);
  fs.rm(filepath, () => {});
}

export default upload;
