-- Create database and user
CREATE DATABASE edc_db;
CREATE USER edc_user WITH PASSWORD 'edc_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE edc_db TO edc_user;

-- Switch to edc_db
\c edc_db;

ALTER SCHEMA public OWNER TO edc_user;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO edc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO edc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO edc_user;


CREATE DATABASE waltid;
CREATE USER waltid WITH PASSWORD 'waltid';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE waltid TO waltid;

-- Switch to edc_db
\c waltid;

ALTER SCHEMA public OWNER TO waltid;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO waltid;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO waltid;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO waltid;