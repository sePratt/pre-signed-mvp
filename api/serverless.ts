import type { AWS } from "@serverless/typescript";
import "reflect-metadata";

import hello from "@functions/hello";

const serverlessConfiguration: AWS = {
  service: "presign-api",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "us-east-2",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",

      // S3 Document Bucket set-up
      S3_DOCUMENT_BUCKET: "pre-signed-dummy-bucket",
      // DO NOT ACTUALLY JUST DEFINE YOUR CREDENTIALS HERE!!!
      S3_ACCESS_KEY_ID: "xxxxxxxxxxxx",
      S3_SECRET_ACCESS_KEY: "xxxxxxxxxxxxxxxxxxxxxxx",
      S3_REGION: "us-east-2",
    },
  },
  // import the function via paths
  functions: { hello },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      DocStorageBucket: {
        Type: "AWS::S3::Bucket",
        DeletionPolicy: "Retain",
        Properties: {
          BucketName: "asi-doc-storage-${self:provider.stage}",
          BucketEncryption: {
            ServerSideEncryptionConfiguration: [
              {
                ServerSideEncryptionByDefault: {
                  SSEAlgorithm: "AES256",
                },
              },
            ],
          },
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "PUT", "DELETE"],
                AllowedOrigins: ["*"],
                Id: "CORSRuleId1",
                MaxAge: "3600",
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
