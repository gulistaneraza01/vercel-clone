import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "ap-south-1", // can be anything for localstack
  endpoint: "http://localhost:4566", // LocalStack endpoint
  forcePathStyle: true, // required for LocalStack
  credentials: {
    accessKeyId: "test", // dummy values, LocalStack doesn’t check
    secretAccessKey: "test",
  },
});

export default s3Client;
