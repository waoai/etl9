# ETL9

**ETL9 makes data pipelining fun.**

Simple all-in-one container for FaaS-based ETL pipelines.

```bash
docker run -p 9123:9123 -v $(pwd)/etl9-config:config etl9
```

- Simple Declarative Interface
- Automatically generated web-based documentation
- Input/Output Type Checking
- GUI for configuring pipelines & types
- API for type-checking and running pipeline jobs
- Hot reloading YAML or JSON configuration
- One docker run and you're ready to start building
- Easy visual debugging, inspection and "pipeline breakpoints"
- Progressive data input (partially completed stages)
- Built to scale for large workloads

## Terminology

- **endpoint**: A service endpoint, usually a URL
- **stage**: A type of data transformation
- **stage function**: The function executed to progress a stage. Every stage function takes 2 arguments, the input and the state of the stage, and return 2 objects, one indicating the new state, and one indicating the output.
- **pipeline**: Configuration of stage(s) and connections to produce a desired output
- **instance**: A running pipeline. Many instances can run from a single pipeline definition.

## Principles

- **Minimize side effects** Each stage function should not maintain state beyond what it returns and is input. State in other services should be avoided (but is often necessary, e.g. uploading to an s3 bucket).
- **Keep payloads small** Don't store a lot of information e.g. files within the state of each stage.
- **Return quickly** Stage functions should complete some progress then immediately return, rather than doing all the work available then returning. In some cases, this may create a lot of network overhead. If network overhead is an issue, complete as much work as possible in 10 seconds then return.

## Progressive Data

Often data is incrementally completed as a stage progresses. etl9 will move progressive data onto subsequent stages that support progressive data, resulting in faster pipeline completion.

## Configuration

The config directory will automatically be generated with some boilerplate code. In this doc, we'll use YAML but you can specify any configuration file in JSON as well.

A configuration file can be placed anywhere in the config directory (e.g. within subdirectories)

```yaml
kind: PipelineTemplate
name: S3TestPipeline
stages:
  pull_s3:
    type: PullFromS3
    inputs:
      s3_source:
        value: s3://example-bucket
  output_logger:
    type: LogOutput
    inputs:
      input:
        node: pull_s3
        output: files
---
kind: Stage
name: PullFromS3
inputs:
  s3_source:
    type: string
    regex_validator: ^s3://.*
  s3_creds:
    type: S3Credentials
    optional: yes
outputs:
  files:
    type: FileList
    progressive: yes
---
kind: Type
name: S3Credentials
superstruct: |
  {
    secretAccessKey: 'string',
    accessKeyId: 'string'
  }
---
kind: Type
name: FileList
superstruct: |
  [{
    url: 'string'
  }]
```

## Production Usage / Persistence

In production, you'll want to use a persistent database external to the container. Use the `PG_*` environment variables to configure your custom database.

| Environment Variable | Purpose                                 |
| -------------------- | --------------------------------------- |
| PG_HOST              | Postgres Database host e.g. `localhost` |
| PG_USER              | Database user                           |
| PG_PASS              | Database password                       |
| PG_PORT              | Database port                           |

## Development

This repository is made up of several services managed by lerna. Here are the main services and their descriptions...

| Service             | Port/Endpoint                     | Description                                        |
| ------------------- | --------------------------------- | -------------------------------------------------- |
| `gui`               | `:9100`, `/*`                     | NextJS user interface for managing pipelines       |
| `master-controller` | `:9101`, `/api/master-controller` | Controls pipeline progression                      |
| `database`          |                                   | Database with state of all active pipelines/stages |
| `database-rest-api` | `:9102`, `/api/db`                | A REST API for the database.                       |
| `stage-api`         | `:9103`, `/api/stage`             | Evoke stage function                               |
| `typecheck-api`     | `:9104`, `/api/typecheck`         | Typecheck API                                      |
| `pipeline-api`      | `:9105`, `/api/pipeline`          | Create or delete pipelines                         |
| `config-sync`       |                                   | Monitor filesystem and load configuration files    |
| `reverse-proxy`     | `:9123`, `*`                      | Reverse proxy, coordinates to correct services     |

## Instance Lifecycle

An instance is created from a pipeline definition. The instance will perform the
following steps until it's completed.

1. Iterate over all it's stages.
2. If input is available for a stage, execute the stage function.
3. Store the resulting state and output of each stage function.
4. If all stages are complete, done. If not, repeat from step 1.
