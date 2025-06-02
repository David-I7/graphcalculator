import multer, { Multer } from "multer";
import fs from "node:fs";
import path from "node:path";
import { Request } from "express";
import sharp from "sharp";
import { publicDirname } from "../constants.js";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export async function deleteFromFs(path: string): Promise<boolean> {
  return new Promise((res, rej) =>
    fs.rm(path, (err) => {
      if (err) rej(err);
      res(true);
    })
  );
}

export default upload;

export function createPathFromUrl(urls: string[], dir: string): string[] {
  return urls.map((url) => path.join(dir, `/${path.basename(url)}`));
}

export function generateUniquefileName(
  file: Express.Multer.File,
  req: Request
): string {
  const ext = file.mimetype.split("/")[1];
  return req.session
    .user!.id.slice(0, 8)
    .concat(new Date().getTime().toString(), ".", ext);
}

export function generateFileUrl(fileName: string) {
  return process.env.SERVER_ORIGIN!.concat("/public/images/", fileName);
}

export async function uploadFile(fileBuffer: Buffer, fileName: string) {
  return sharp(fileBuffer)
    .resize(80, 80)
    .toFile(path.join(publicDirname, "/images/", fileName));
}

export async function deleteFiles(paths: string[], concurrency: number = 4) {
  const queue = paths;
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const filePath = queue.pop()!;
      try {
        await new Promise<boolean>((res, rej) => {
          fs.unlink(filePath, (err) => {
            if (err) rej(err);
            else res(true);
          });
        });
      } catch (err) {
        return false;
      }
    }
    return true;
  });
  return Promise.all(workers);
}
