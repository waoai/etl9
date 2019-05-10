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
* One docker run and you're ready to start building
* Built to scale for large workloads

## Terminology

* **endpoint**: A service endpoint, usually a URL
* **stage**: A type of data transformation
* **stage function**: The function executed to progress a stage. Every stage function takes 2 arguments, the input and the state of the stage, and return 2 objects, one indicating the new state, and one indicating the output.

## Principles

* **Minimize side effects** Each stage function should not maintain state beyond what it returns and is input. State in other services should be avoided (but is often necessary, e.g. uploading to an s3 bucket), but the service itself must not maintain state itself.
* **Keep payloads small** Don't store a lot of information e.g. files within the state of each stage.
* **Return quickly** Stage functions should complete some progress then immediately return, rather than doing all the work available then returning. In some cases, this may create a lot of network overhead. If network overhead is an issue, complete as much work as possible in 10 seconds then return.
