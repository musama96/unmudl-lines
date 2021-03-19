import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

export const UPLOAD_ACL = 'public-read';

export const s3 = new AWS.S3();

export const moveFilesToS3 = async (destination: string, files: any): Promise<void> => {
  const uploads = [];
  for (let field in files) {
    for (let file of files[field]) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file.destination.replace(/^\//, '') + file.filename,
        Body: file.buffer,
        ACL: UPLOAD_ACL,
      };
      uploads.push(params);
      // await s3.putObject(params).promise();
    }
  }
  await Promise.all(uploads.map(upload => s3.putObject(upload).promise()));
};

export const removeFilesFromS3 = async (files: any): Promise<void> => {
  files.map(async file => {
    if (file && file.length > 0) {
      try {
        fs.unlinkSync(`./public${file}`);
      } catch (err) {
        console.log(err);
        return true;
      }
    } else {
      return true;
    }
  });
  const uploads = files.map(file => {
    if (file && file.length > 0) {
      file = file.substring(1);
      return { Bucket: process.env.S3_BUCKET_NAME, Key: file };
    }
  });

  (await process.env.AWS_ACCESS_KEY_ID) && process.env.AWS_ACCESS_KEY_ID.length > 0
    ? Promise.all(uploads.map(upload => s3.deleteObject(upload).promise()))
    : null;
};

export const setFilenameAndDestination = (destination: string, files: any) => {
  //set files destination and filename
  destination = destination.replace(/^\//, '');
  const updatedFiles = Object.keys(files).reduce((prev, field) => {
    prev[field] = files[field].map(file => {
      file.destination = destination;
      return file;
    });
    return prev;
  }, {});
  return updatedFiles;
};
