# Stage API

The Stage API allows you to easily call the stage function of any stage by
redirecting the call out to the stage's endpoint. It will also check all the
types of the request, making sure that the response and request are compliant
with the stage definition's types.

## Endpoints

| Endpoint      | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| `/:stagename` | Execute stage function given by `stagename`, check types          |
| `/custom`     | Execute a custom stage function given by a body parameter `stage` |
