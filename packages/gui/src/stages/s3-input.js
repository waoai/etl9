export default {
  stageName: "s3-input",
  description: "Transforms s3 uri into remote files.",
  inputs: [
    { name: "s3Uri", type: "string", description: "S3 URI to Data" },
    {
      name: "validFileTypes",
      optional: true,
      type: "Set<string>",
      description: "Acceptable file formats when scanning directory"
    },
    {
      name: "accessKeyId",
      optional: true,
      type: "string",
      description: "AWS Access Key"
    },
    {
      name: "secretAccessKey",
      optional: true,
      type: "string",
      description: "AWS Secret Key"
    }
  ],
  outputs: [
    {
      name: "files",
      type: "Set<RemoteFile>",
      description: "Output files with secure proxy links"
    }
  ]
}
