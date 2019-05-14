# ETL9

Simple all-in-one container for microservice-based ETL pipelines.

```bash
docker run -p 9123:9123 -v $(pwd)/etl9-config:config etl9
```

* Simple Declarative Interface
* Automatically generated web-based documentation
* Input/Output Type Checking
* GUI for configuring pipelines & types
* API for type-checking and running pipeline jobs
* Hot reloading YAML or JSON configuration
* One docker run and you're ready to start building
* Easy visual debugging and inspection
* Progressive data input (partially completed stages)
* Built to scale for large workloads

## Terminology

* **endpoint**: A service endpoint, usually a URL
* **stage**: A type of data transformation
* **stage function**: The function executed to progress a stage. Every stage function takes 2 arguments, the input and the state of the stage, and return 2 objects, one indicating the new state, and one indicating the output.

## Principles

* **Minimize side effects** Each stage function should not maintain state beyond what it returns and is input. State in other services should be avoided (but is often necessary, e.g. uploading to an s3 bucket).
* **Keep payloads small** Don't store a lot of information e.g. files within the state of each stage.
* **Return quickly** Stage functions should complete some progress then immediately return, rather than doing all the work available then returning. In some cases, this may create a lot of network overhead. If network overhead is an issue, complete as much work as possible in 10 seconds then return.

## Progressive Data

Often data is incrementally completed as a stage progresses. etl9 will move progressive data onto subsequent stages that support progressive data, resulting in faster pipeline completion.

## Configuration

The config directory will automatically be generated with some boilerplate code. In this doc, we'll use YAML but you can specify any configuration file in JSON as well.

A configuration file can be placed anywhere in the config directory (e.g. within subdirectories)

```yaml
kind: Stage
name: PullFromS3
inputs:
  s3_dest:
    type: string
    regex_validator: ^s3://.*
  s3_creds:
    type: S3Credentials
outputs:
  files:
    type: FileList
    progressive: true
---
kind: Type
name: S3Credentials
flowtype: |
  {|
    secretAccessKey: string,
    accessKeyId: string
  |}
---
kind: Type
name: FileList
flowtype: |
  Array<{|
    url: string
  |}>
```

## Production Usage / Persistence

In production, you'll want to use a persistent database external to the container. Use the `PG_*` environment variables to configure your custom database.

| Environment Variable | Purpose                                 |
| -------------------- | --------------------------------------- |
| PG_HOST              | Postgres Database host e.g. `localhost` |
| PG_USER              | Database user                           |
| PG_PASS              | Database password                       |
| PG_PORT              | Database port                           |
