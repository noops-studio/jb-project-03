import fs from 'fs';
import path from 'path';
import { uploadFile } from './s3';
import { Vacation } from '../models/vacation.model';

/**
 * Syncs all files from the uploads directory to S3 and updates vacation records
 * to ensure all vacation images are properly available in S3
 */
export async function syncUploadsToS3() {
  try {
    // Create the uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    try {
      // Test S3 connection - if this fails, we'll just skip S3 upload
      // and use local files instead
      await uploadFile(Buffer.from('test'), 'test.txt', 'text/plain');
      console.log('S3 connection successful, proceeding with uploads');

      // Get all files in uploads directory
      const files = fs.readdirSync(uploadsDir);
      console.log(`Found ${files.length} files in uploads directory`);

      // Track files that have been uploaded to S3
      const uploadedFiles = new Map<string, string>();

      // Process each file
      for (const file of files) {
        // Skip hidden files or directories
        if (file.startsWith('.') || !fs.statSync(path.join(uploadsDir, file)).isFile()) {
          continue;
        }

        try {
          // Read file
          const filePath = path.join(uploadsDir, file);
          const fileBuffer = fs.readFileSync(filePath);
          
          // Determine mime type (simple mapping)
          let mimeType = 'application/octet-stream';
          const ext = path.extname(file).toLowerCase();
          if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
          else if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.gif') mimeType = 'image/gif';
          
          // Upload to S3
          const s3Key = await uploadFile(fileBuffer, file, mimeType);
          uploadedFiles.set(file, s3Key);
          console.log(`Uploaded ${file} to S3 as ${s3Key}`);
        } catch (err: any) {
          console.error(`Error processing file ${file}:`, err);
        }
      }

      // Update vacation records in the database
      // Only update if there are uploaded files
      if (uploadedFiles.size > 0) {
        // Get all vacations that reference uploaded files
        const vacations = await Vacation.findAll();
        
        for (const vacation of vacations) {
          const imageFileName = vacation.get('imageFileName') as string;
          
          // Handle both cases: 
          // 1. Vacation references a local file that we just uploaded to S3
          // 2. Vacation already references an S3 key
          
          if (uploadedFiles.has(imageFileName)) {
            // Update the vacation to use the S3 key instead of local filename
            const s3Key = uploadedFiles.get(imageFileName)!;
            await vacation.update({ imageFileName: s3Key });
            console.log(`Updated vacation ID ${vacation.get('id')} to use S3 key ${s3Key}`);
          }
        }
      }

      console.log('Uploads sync completed successfully');
    } catch (err: any) {
      console.warn('S3 upload failed, will serve images locally instead:', err.message);
      // Don't throw, we'll just serve files locally
      global.useLocalImages = true;
    }
  } catch (err: any) {
    console.error('Error in upload sync process:', err);
    global.useLocalImages = true;
  }
}