-- =========================================================
-- Least-privilege application role for AWS RDS
-- =========================================================
-- Run manually by a database administrator (NOT by the app),
-- AFTER `npm run db:migrate` has created the tables, connected
-- to the SiPinter database as the RDS master user or another
-- role that owns the schema:
--
--   psql "host=<rds-endpoint> dbname=<db> user=<admin> sslmode=verify-full sslrootcert=<ca-bundle.pem>" \
--     -v app_user=sipinter_app \
--     -v app_password='<strong-generated-password>' \
--     -f deploy/scripts/create-app-user.sql
--
-- Roles:
--   * Migration/owner role (the admin you connect with): runs `npm run db:migrate`, owns tables.
--   * :app_user: used by the running API. Can read/write rows, cannot change the schema.
--
-- Do not commit real passwords. Store them in a secret manager or the server's .env file.
-- =========================================================

\set ON_ERROR_STOP on

CREATE ROLE :"app_user" WITH LOGIN PASSWORD :'app_password'
    NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;

-- Connect to this database only; no access to other databases on the instance.
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'app_user') \gexec

-- Use objects in the public schema, but never create new ones.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO :"app_user";

-- Row-level data access on existing tables and identity sequences.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"app_user";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"app_user";

-- The app may read which migrations ran, but never modify that history.
REVOKE INSERT, UPDATE, DELETE ON schema_migrations FROM :"app_user";

-- Tables created by future migrations (run by the current role) get the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO :"app_user";
