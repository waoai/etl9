CREATE TABLE system_instance_profile (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id text references instance NOT NULL,
  started_at timestamptz NOT NULL DEFAULT current_timestamp,
  ended_at timestamptz,
  duration float GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ended_at - started_at))) STORED
);

CREATE TABLE system_stage_profile (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id text references instance NOT NULL,
  stage_id text NOT NULL,
  stage_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT current_timestamp,
  ended_at timestamptz,
  duration float GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ended_at - started_at))) STORED
);

CREATE TABLE system_loop_profile (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_count integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT current_timestamp,
  ended_at timestamptz,
  duration float GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (ended_at - started_at))) STORED
);
