import * as AWS from 'aws-sdk';
export declare const UPLOAD_ACL = "public-read";
export declare const s3: AWS.S3;
export declare const moveFilesToS3: (destination: string, files: any) => Promise<void>;
export declare const removeFilesFromS3: (files: any) => Promise<void>;
export declare const setFilenameAndDestination: (destination: string, files: any) => {};
