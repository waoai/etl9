// @flow

import React, { createContext, useContext } from "react"

const delayAndReturn = result => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 200)
  })
}

const mockData = {
  getPipelines: () => delayAndReturn([]),
  getPipelineTemplates: () =>
    delayAndReturn([
      {
        name: "S3TestPipeline",
        stages: {
          pull_s3: {
            inputs: {
              s3_source: { value: "s3://example-bucket" }
            }
          },
          output_logger: {
            type: "LogOutput",
            inputs: { input: { node: "pull_s3", output: "files" } }
          }
        }
      }
    ]),
  getStages: () =>
    delayAndReturn([
      {
        name: "PullFromS3",
        description: "Pull files from S3 Bucket",
        inputs: {
          s3_source: {
            type: "string",
            regex_validator: "^s3://.*"
          },
          s3_creds: {
            type: "S3Credentials",
            optional: "yes"
          }
        },
        outputs: {
          files: {
            type: "FileList",
            progressive: "yes"
          }
        }
      },
      {
        name: "PushToS3",
        description: "Push files to an S3 Bucket",
        inputs: {
          files: {
            type: "FileList"
          }
        },
        outputs: {
          files: {
            type: "FileList",
            progressive: "yes"
          }
        }
      }
    ]),
  getTypes: () =>
    delayAndReturn([
      {
        name: "S3Credentials",
        superstruct:
          "{\n  secretAccessKey: 'string',\n  accessKeyId: 'string'\n}\n"
      },
      {
        name: "FileList",
        superstruct: "[{\n  url: 'string'\n}]\n"
      }
    ])
}

export const APIProvider = createContext(mockData)

export const useAPI = () => {
  return useContext(APIProvider)
}
