-- Runs once, when the local Docker volume is first created.
-- A separate database for automated tests, so tests never touch development data.
CREATE DATABASE sipinter_test OWNER sipinter;
