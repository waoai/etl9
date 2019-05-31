CREATE TABLE definition (
  entity_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  def jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE UNIQUE INDEX definition_name ON definition((def ->> 'name'));


CREATE FUNCTION check_definition_update() RETURNS trigger AS $check_definition_update$
    BEGIN
        IF NEW.def->>'kind' NOT IN ('Pipeline', 'Stage', 'Type') THEN
            RAISE EXCEPTION 'kind must be "Pipeline", "Stage" or "Type"';
        END IF;

        NEW.updated_at := now();

        RETURN NEW;
    END;
$check_definition_update$ LANGUAGE plpgsql;

CREATE TRIGGER check_definition_update BEFORE INSERT OR UPDATE ON definition
    FOR EACH ROW EXECUTE PROCEDURE check_definition_update();

CREATE VIEW type_def AS
  SELECT definition.def->>'name' as name, *
  FROM definition
  WHERE definition.def->>'kind' = 'Type';

CREATE VIEW stage_def AS
  SELECT definition.def->>'name' as name, *
  FROM definition
  WHERE definition.def->>'kind' = 'Stage';

CREATE VIEW pipeline_def AS
  SELECT definition.def->>'name' as name, *
  FROM definition
  WHERE definition.def->>'kind' = 'Pipeline';

CREATE TABLE instance (
  id text NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pipeline_def jsonb NOT NULL,
  instance_state jsonb NOT NULL
);

CREATE TABLE env_var (
  name text NOT NULL PRIMARY KEY,
  value text NOT NULL,
  encrypted boolean NOT NULL DEFAULT FALSE
);


-- CREATE TABLE typedef (
--   typedef_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL UNIQUE,
--   def jsonb NOT NULL,
-- );
--
-- CREATE TABLE stagedef (
--   name text NOT NULL UNIQUE,
--   def jsonb NOT NULL
-- );
--
-- CREATE TABLE pipelinedef (
--   name text NOT NULL PRIMARY KEY,
--   def jsonb NOT NULL
-- );
--
--
-- CREATE TABLE pipeline (
--   pipeline_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
--   nid serial NOT NULL UNIQUE,
--   pipeline_name text,
--   definition jsonb,
--   active boolean NOT NULL DEFAULT FALSE,
--   archived boolean NOT NULL DEFAULT FALSE,
--   created_at timestamp NOT NULL DEFAULT current_timestamp,
--   CHECK (NOT (active = TRUE AND archived = TRUE))
-- );
--
-- CREATE TABLE pipeline_stage (
--   pipeline_stage_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
--   pipeline_id uuid references pipeline NOT NULL,
--   stage_name text NOT NULL,
--   stage_type text NOT NULL,
--   input_connections jsonb,
--   outputs jsonb,
--   state jsonb,
--   error text,
--   progress float NOT NULL DEFAULT 0.0,
--   paused boolean NOT NULL DEFAULT 'false',
--   complete boolean NOT NULL DEFAULT 'false',
--   created_at timestamp NOT NULL DEFAULT current_timestamp,
--   UNIQUE (pipeline_id, stage_name)
-- );
--
-- CREATE TABLE pipeline_stage_log (
--   pipeline_stage_log uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
--   pipeline_stage_id uuid references pipeline_stage,
--   info text NOT NULL,
--   created_at timestamp NOT NULL DEFAULT current_timestamp
-- );

-- CREATE TABLE execution_period (
--   execution_period_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
--   pipeline_stage_id uuid references pipeline NOT NULL,
--   active boolean NOT NULL DEFAULT 'true',
--   start_time timestamp NOT NULL DEFAULT current_timestamp,
--   end_time timestamp
-- );
