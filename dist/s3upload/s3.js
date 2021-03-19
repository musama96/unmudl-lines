"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();
exports.UPLOAD_ACL = 'public-read';
exports.s3 = new AWS.S3();
exports.moveFilesToS3 = async (destination, files) => {
    const uploads = [];
    for (let field in files) {
        for (let file of files[field]) {
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: file.destination.replace(/^\//, '') + file.filename,
                Body: file.buffer,
                ACL: exports.UPLOAD_ACL,
            };
            uploads.push(params);
        }
    }
    await Promise.all(uploads.map(upload => exports.s3.putObject(upload).promise()));
};
exports.removeFilesFromS3 = async (files) => {
    files.map(async (file) => {
        if (file && file.length > 0) {
            try {
                fs.unlinkSync(`./public${file}`);
            }
            catch (err) {
                console.log(err);
                return true;
            }
        }
        else {
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
        ? Promise.all(uploads.map(upload => exports.s3.deleteObject(upload).promise()))
        : null;
};
exports.setFilenameAndDestination = (destination, files) => {
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
//# sourceMappingURL=s3.js.map