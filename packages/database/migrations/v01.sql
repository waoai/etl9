
CREATE TABLE pipeline (
  pipeline_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nid serial NOT NULL UNIQUE,
  pipeline_name text,
  definition jsonb,
  active boolean NOT NULL DEFAULT FALSE,
  archived boolean NOT NULL DEFAULT FALSE,
  created_at timestamp NOT NULL DEFAULT current_timestamp,
  CHECK (NOT (active = TRUE AND archived = TRUE))
);

CREATE TABLE pipeline_stage (
  pipeline_stage_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid references pipeline NOT NULL,
  stage_name text NOT NULL,
  stage_type text NOT NULL,
  input_connections jsonb,
  outputs jsonb,
  state jsonb,
  error text,
  progress float NOT NULL DEFAULT 0.0,
  paused boolean NOT NULL DEFAULT 'false',
  complete boolean NOT NULL DEFAULT 'false',
  created_at timestamp NOT NULL DEFAULT current_timestamp,
  UNIQUE (pipeline_id, stage_name)
);

CREATE TABLE pipeline_stage_log (
  pipeline_stage_log uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_stage_id uuid references pipeline_stage,
  info text NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp
);

-- CREATE TABLE execution_period (
--   execution_period_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
--   pipeline_stage_id uuid references pipeline NOT NULL,
--   active boolean NOT NULL DEFAULT 'true',
--   start_time timestamp NOT NULL DEFAULT current_timestamp,
--   end_time timestamp
-- );
