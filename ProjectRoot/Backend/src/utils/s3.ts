import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
    PutObjectCommand,
    DeleteObjectCommand,
  } from "@aws-sdk/client-s3";
  import { v4 as uuidv4 } from "uuid";
  import dotenv from "dotenv";
  
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
    } catch (error: any) {
      // If error indicates bucket not found, create it.
      if (
        error.name === "NotFound" ||
        (error.$metadata && error.$metadata.httpStatusCode === 404)
      ) {
        console.log(`Bucket "${bucketName}" does not exist. Creating...`);
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`Bucket "${bucketName}" created successfully.`);
      } else {
        console.error("Error checking bucket:", error);
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
    // Create a unique file key – here we preserve the extension
    const ext = originalName.substring(originalName.lastIndexOf("."));
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
  }
  
  /**
   * Delete a file from S3 given its key.
   * @param key - The S3 key (filename) of the file to delete.
   */
  export async function deleteFile(key: string): Promise<void> {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
  }