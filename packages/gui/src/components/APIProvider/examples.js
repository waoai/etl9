// @flow

import moment from "moment"

export const pipelines = [
  {
    name: "S3TestPipeline",
    description: "Log Files from S3",
    nodes: {
      pull_s3: {
        name: "PullFromS3",
        inputs: {
          s3_source: { key: "s3_source" }
        }
      },
      pull_golden_set: {
        name: "PullFromS3",
        inputs: {
          s3_source: { value: "s3://example-bucket" },
          whitelist: { value: ["data/sound1.mp3", "data/sound2.mp3"] }
        }
      },
      add_answers_to_golden_set: {
        name: "AddMetaInformationToFiles",
        inputs: {
          files: { node: "pull_golden_set", output: "files" },
          meta_information: {
            value: {
              "data/sound1.mp3": { answer: "validation answer 1" },
              "data/sound2.mp3": { answer: "validation answer 2" }
            }
          }
        }
      },
      convert_to_transcription_task: {
        name: "ConvertToAudioTranscriptionTask",
        inputs: {
          golden_set: {
            node: "add_answers_to_golden_set",
            output: "files"
          },
          files: { node: "pull_s3", output: "files" }
        }
      },
      output_logger: {
        name: "LogOutput",
        inputs: { input: { node: "pull_s3", output: "files" } }
      }
    }
  }
]

export const stages = [
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
        optional: true
      },
      whitelist: {
        type: "StringArray",
        optional: true
      }
    },
    outputs: {
      files: {
        type: "FileList",
        progressive: true
      }
    }
  },
  {
    name: "AddMetaInformationToFiles",
    description: "Add information to file array",
    inputs: {
      files: { type: "FileList" },
      meta_information: { type: "Object" }
    },
    outputs: {
      files: { type: "FileList" }
    }
  },
  {
    name: "ConvertToAudioTranscriptionTask",
    description: "Convert audio files into human transcription tasks",
    inputs: {
      golden_set: { type: "FileList" },
      files: { type: "FileList" }
    },
    outputs: {
      task_config: { type: "TaskConfiguration" },
      tasks: { type: "HumanTaskArray", progressive: true }
    }
  },
  {
    name: "ProcessHumanTasks",
    description: "Upload tasks to human platform and process",
    inputs: {
      humanTasks: { type: "HumanTaskArray" }
    },
    outputs: {
      taskOutput: { type: "TaskOutputArray" }
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
        progressive: true
      }
    }
  },
  {
    name: "LogOutput",
    description: "Log Output to ETL9 Server",
    inputs: {
      input: {
        type: "any"
      }
    }
  }
]

export const types = [
  {
    name: "S3Credentials",
    superstruct: "{\n  secretAccessKey: 'string',\n  accessKeyId: 'string'\n}\n"
  },
  {
    name: "FileList",
    superstruct: "[{\n  url: 'string'\n}]\n"
  },
  {
    name: "StringArray",
    superstruct: "[string]"
  }
]

export const envVars = [
  {
    name: "DEFAULT_OUTPUT_BUCKET",
    value: "s3://example-bucket"
  },
  {
    name: "DOCKER_USER",
    value: "dockeruser"
  },
  {
    name: "DOCKER_PASS",
    value: "somepassword",
    encrypted: true
  }
]

export const pipelineInstances = [
  {
    id: "someid1",
    createdAt: moment()
      .utc()
      .toString(),
    completed: false,
    progress: 0.2,
    pipelineDefinition: pipelines[0],
    stageStates: {
      pull_s3: {
        progress: 0.5,
        state: {},
        output: {
          files: [
            { url: "http://example.com/test1.txt" },
            { url: "http://example.com/test2.txt" }
          ]
        }
      },
      pull_golden_set: {
        progress: 0,
        error: {
          message: "Could not find S3 bucket"
        },
        state: {},
        output: {}
      },
      add_answers_to_golden_set: {
        state: null,
        output: {}
      }
    }
  }
]
