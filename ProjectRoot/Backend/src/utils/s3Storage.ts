// src/utils/s3Storage.ts
import { Request } from "express";
import { StorageEngine } from "multer";
import { uploadFile, deleteFile } from "./s3";

class S3Storage implements StorageEngine {
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error?: any, info?: Partial<Express.Multer.File>) => void
  ) {
    const chunks: Buffer[] = [];

    file.stream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    file.stream.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      try {
        // Upload the file to S3 and get the S3 key in return.
        const key = await uploadFile(buffer, file.originalname, file.mimetype);
        // Return the key in the file info, so req.file.filename will contain the S3 key.
        cb(null, {
          filename: key,
          size: buffer.length,
        });
      } catch (err) {
        cb(err);
      }
    });

    file.stream.on("error", (err) => {
      cb(err);
    });
  }

  _removeFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null) => void
  ) {
    // Remove the file from S3 using the key stored in file.filename.
    if (file.filename) {
      deleteFile(file.filename)
        .then(() => cb(null))
        .catch(cb);
    } else {
      cb(null);
    }
  }
}

export default new S3Storage();
