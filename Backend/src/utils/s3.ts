import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
    PutObjectCommand,
    DeleteObjectCommand,
  } from "@aws-sdk/client-s3";
  import { v4 as uuidv4 } from "uuid";
  import dotenv from "dotenv";
  import fs from "fs";
  import path from "path";
  
  dotenv.config();
  
  // Configuration: use environment variables if available.
  const endpoint = process.env.S3_ENDPOINT || "http://localhost:4566";
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "test";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "test";
  const bucketName = process.env.S3_BUCKET || "vecations";
  
  export const s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // needed for LocalStack
  });
  
  /**
   * Check if the bucket exists and create it if not.
   */
  export async function checkAndCreateBucket() {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket "${bucketName}" exists.`);
      global.useLocalImages = false;
      return true;
    } catch (error: any) {
      // If error indicates bucket not found and we can connect, create it.
      if (
        error.name === "NotFound" ||
        (error.$metadata && error.$metadata.httpStatusCode === 404)
      ) {
        try {
          console.log(`Bucket "${bucketName}" does not exist. Creating...`);
          await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
          console.log(`Bucket "${bucketName}" created successfully.`);
          global.useLocalImages = false;
          return true;
        } catch (e) {
          console.error("Failed to create bucket:", e);
          global.useLocalImages = true;
          return false;
        }
      } else {
        console.error("Error checking bucket:", error);
        global.useLocalImages = true;
        return false;
      }
    }
  }
  
  /**
   * Upload file buffer to S3.
   * @param buffer - File data as a Buffer.
   * @param originalName - Original file name.
   * @param mimetype - MIME type of the file.
   * @returns The S3 key (filename) for the stored file.
   */
  export async function uploadFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string
  ): Promise<string> {
    try {
      // If we're using local images due to a previous error, just return the original name
      if (global.useLocalImages) {
        return originalName;
      }
      
      // Create a unique file key – here we preserve the extension
      const ext = originalName.substring(originalName.lastIndexOf(".")) || '';
      const key = `${Date.now()}-${uuidv4()}${ext}`;
    
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      };
    
      await s3Client.send(new PutObjectCommand(params));
      console.log(`File uploaded to S3 with key: ${key}`);
      return key;
    } catch (err: any) {
      console.error("Error uploading to S3:", err.message);
      global.useLocalImages = true;
      // Return the original name as fallback
      return originalName;
    }
  }
  
  /**
   * Delete a file from S3 given its key.
   * @param key - The S3 key (filename) of the file to delete.
   */
  export async function deleteFile(key: string): Promise<void> {
    try {
      // Skip S3 delete operation if we're in local mode
      if (global.useLocalImages) {
        // Check if this is a local file (not an S3 key)
        const uploadsPath = path.join(process.cwd(), 'uploads', key);
        if (fs.existsSync(uploadsPath)) {
          fs.unlinkSync(uploadsPath);
          console.log(`Deleted local file: ${key}`);
        }
        return;
      }
      
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
      console.log(`Deleted file from S3: ${key}`);
    } catch (err: any) {
      console.error("Error deleting file:", err.message);
      // If S3 deletion fails, mark as using local images for future operations
      global.useLocalImages = true;
    }
  }
  
  /**
   * Gets a public URL for an S3 object
   * @param key - The S3 key (filename) of the file
   * @returns The URL to access the file
   */
  export function getPublicUrl(key: string): string {
    // Use a different endpoint for client-facing URLs vs backend upload URLs
    // Backend uses internal docker network, but frontend needs publicly accessible URL
    const clientEndpoint = process.env.S3_PUBLIC_ENDPOINT || "http://localhost:4566";
    const bucket = process.env.S3_BUCKET || "vacations";
    return `${clientEndpoint}/${bucket}/${key}`;
  }