# Instance Controller

The instance controller iterates over active instances and executes stage functions until each instance is complete.

## Optimization

The instance controller tries to minimize bandwidth by reducing the number of calls to each stage function. To that end, it calculates when it expects each stage to be complete by the
rate of it's progress changing. It operates under several constraints, namely...

- Don't call a stage function more than once every second.
- Call a stage function atleast once every 5 minutes.

Observing the rate of change of the progress provides an easy way to guess when
a stage is expected to be completed. Using the equation below, the time until
completion can be estimated.

```javascript
tx = "current time"
t0 = "time when stage function started"
progress_rate = progress_tx / (tx - t0)
time_until_complete = (1 - progress_tx) / progress_rate
```

After computing `time_until_complete`, the instance controller can delay for a
subset of that time. **The rule of thumb is `min(5 min, time_until_complete/2 + 1 second)`.**

Often, the first couple minutes of stage function execution don't fully reflect the rate of progress change, or the progress change is non-linear. So the recommended delay function should take into account the number of delays and err on the side of calling the stage function more often. The rule of thumb is **the maximum delay should be no greater than half the time of the function's execution.**.

The full delay equation is as follows...

```javascript
delay = min(5 min, time_until_complete/2 + 1 second, (tx - t0)/2)
```

## Instance Lifecycle

An instance is created from a pipeline definition. The instance will perform the
following steps until it's completed.

1. Iterate over all it's stages.
2. If input is available for a stage, execute the stage function.
3. Store the resulting state and output of each stage function.
4. If all stages are complete, done. If not, repeat from step 1.
