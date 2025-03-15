// src/services/s3.service.ts
import AWS from 'aws-sdk';
import config from 'config';
import { v4 as uuidv4 } from 'uuid';

interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string | null;
  forcePathStyle?: boolean;
}

export class S3Service {
  private s3: AWS.S3;
  private bucket: string;
  private endpoint?: string | null;

  constructor() {
    // Cast config.get to our interface
    const awsConfig = config.get<S3Config>('aws.s3');
    
    // Configure S3 with optional endpoint for LocalStack
    const s3Options: AWS.S3.ClientConfiguration = {
      region: awsConfig.region,
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey
    };
    
    // If endpoint is defined, use it (for LocalStack)
    if (awsConfig.endpoint) {
      s3Options.endpoint = awsConfig.endpoint;
      s3Options.s3ForcePathStyle = awsConfig.forcePathStyle || false;
    }

    this.s3 = new AWS.S3(s3Options);
    this.bucket = awsConfig.bucket;
    this.endpoint = awsConfig.endpoint;
    
    console.log(`S3 Service configured with bucket: ${this.bucket}`);
    if (this.endpoint) {
      console.log(`Using custom endpoint: ${this.endpoint}`);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Generate a UUID v4 filename (already implemented)
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: this.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' // Make the file publicly accessible
    };

    await this.s3.upload(params).promise();
    return fileName;
  }

  // Updated to use the endpoint if available
  getImageUrl(fileName: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${fileName}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      Key: fileName
    };

    await this.s3.deleteObject(params).promise();
  }
}