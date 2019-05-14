-- ---------------------- --
-- THIS FILE IS GENERATED --
-- DO NOT EDIT            --
-- ---------------------- --

DO $MAIN$
DECLARE
    db_version integer;
BEGIN
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "metakeystore" (
    key_id character varying(255) PRIMARY KEY,
    integer_value integer,
    string_value character varying(255)
);

IF NOT EXISTS (SELECT 1 FROM metakeystore WHERE key_id='db_version') THEN
    RAISE NOTICE 'Setting db_version to 0';
    INSERT INTO metakeystore (key_id, integer_value) VALUES ('db_version', 0);
END IF;

db_version := (SELECT integer_value FROM metakeystore WHERE key_id='db_version');

RAISE NOTICE 'DATABASE VERSION = %', db_version;

-- --------------------------------------------
-- VERSION 1
-- --------------------------------------------

IF (db_version=0) THEN
    RAISE NOTICE 'Migrating db_version to 1';

    
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
  stage_id text NOT NULL,
  is_input_stage boolean NOT NULL DEFAULT 'false',
  is_output_stage boolean NOT NULL DEFAULT 'false',
  input_stages text[],
  output jsonb,
  meta_output jsonb,
  complete boolean NOT NULL DEFAULT 'false',
  state jsonb,
  progress float NOT NULL DEFAULT 0.0,
  params jsonb NOT NULL DEFAULT '{}',
  stage_type text,

  created_at timestamp NOT NULL DEFAULT current_timestamp,
  UNIQUE (pipeline_id, stage_id)
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


    UPDATE metakeystore SET integer_value=1 WHERE key_id='db_version';
    db_version := (SELECT integer_value FROM metakeystore WHERE key_id='db_version');
END IF;

-- --------------------------------------------
-- VERSION 2
-- --------------------------------------------

IF (db_version=1) THEN
    RAISE NOTICE 'Migrating db_version to 2';

    ALTER TABLE pipeline_stage ADD COLUMN error text;


    UPDATE metakeystore SET integer_value=2 WHERE key_id='db_version';
    db_version := (SELECT integer_value FROM metakeystore WHERE key_id='db_version');
END IF;



END
$MAIN$ LANGUAGE plpgsql;