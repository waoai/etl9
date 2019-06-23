# Core Types

There are three core types you need to know to use ETL9. [Pipeline](#pipeline), [Stage](#stage), and [Type](#type). These three types work together to create robust repeatable orchestrated systems.

## Pipeline

A pipeline is a s configuration of stage(s) and connections to produce a desired output. A running pipeline is an _instance_ of a pipeline.

A YAML pipeline template is defined as follows...

```yaml
kind: Pipeline
name: S3TestPipeline

# This is where we define any involved stages and their connections
nodes:
  # pull_s3 is the identifier for this stage instance, it can be referenced
  # by other stages
  pull_s3:
    # This is the name of the stage that defines this instance
    name: PullFromS3
    # Now we can connect the inputs to this stage.
    inputs:
      # s3_source is the key (or parameter) that is required for PullFromS3
      s3_source:
        # Here we're setting the s3_source to a value. You can set a connection
        # as a value or a reference to the output key of another stage
        value: s3://example-bucket
  # output_logger is another identifier for a new stage instance
  output_logger:
    # LogOutput is a stage that simply logs the output to ETL9 logs
    name: LogOutput
    inputs:
      # Here's we're setting the input key "input" to connect to the "pull_s3"
      # stage output key "files"
      input:
        node: pull_s3
        output: files
```

## Stage

A stage is a small executable piece of code that can have inputs and outputs.

```yaml
kind: Stage
name: PullFromS3

# Here we define all the inputs to our stage and their types
inputs:
  s3_source:
    type: string
    regex_validator: ^s3://.*
  s3_creds:
    type: S3Credentials
    optional: yes

# Now we can define all the outputs
outputs:
  files:
    type: FileList
    # A progressive output can be completed incrementally.
    progressive: yes
```

### Progressive Inputs/Outputs

When an input is progressive and an output is progressive, a stage can begin
executing _before_ it's dependent stages are fully completed. For example, if
you're reading files from Dropbox, and that operation takes five minutes, you
can send files over incrementally to the next stage.

If a stage isn't set up for progressive execution (by defining the
inputs/outputs to be progressive) it will need to wait for the previous stage's
completion before moving on.

## Type

Every stage has an input/output that is contrained to be in the form of a
predefined type. This makes sure that every stage is inputing/outputing
properly.

Types can be defined in two ways. You can put a superstruct string directly
into whereever you're inputing a type, or you can give the name of a predefined
type.

```yaml
# Here we define an array of objects with urls which we call a FileList
kind: Type
name: FileList

# Superstruct is the default way to define types.
# https://github.com/ianstormtaylor/superstruct
superstruct: |
  [{
    url: 'string'
  }]
```
