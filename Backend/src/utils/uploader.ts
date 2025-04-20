// src/utils/uploader.ts
import multer from "multer";
import s3Storage from "./s3Storage";

function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
}

export const upload = multer({ storage: s3Storage, fileFilter });
