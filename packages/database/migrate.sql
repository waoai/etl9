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

    CREATE TABLE definition (
  entity_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  def jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE UNIQUE INDEX definition_name ON definition(LOWER(def ->> 'name'));


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
  -- parent_pipeline uuid references definition(entity_id),
  params jsonb NOT NULL DEFAULT '{}',
  pipeline_def jsonb NOT NULL,
  instance_state jsonb,
  created_at timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TABLE env_var (
  name text NOT NULL PRIMARY KEY,
  value text NOT NULL,
  encrypted boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE log_entry (
  log_item_id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  tags text[] NOT NULL DEFAULT '{}',
  summary text NOT NULL,
  info jsonb,
  level text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT current_timestamp
);


CREATE FUNCTION check_log_entry() RETURNS trigger AS $check_log_entry$
    BEGIN
        IF NEW.level NOT IN ('error', 'warning', 'info') THEN
            RAISE EXCEPTION 'level must be "error", "warning" or "info"';
        END IF;

        RETURN NEW;
    END;
$check_log_entry$ LANGUAGE plpgsql;

CREATE TRIGGER check_log_entry BEFORE INSERT OR UPDATE ON log_entry
    FOR EACH ROW EXECUTE PROCEDURE check_log_entry();


    UPDATE metakeystore SET integer_value=1 WHERE key_id='db_version';
    db_version := (SELECT integer_value FROM metakeystore WHERE key_id='db_version');
END IF;



END
$MAIN$ LANGUAGE plpgsql;