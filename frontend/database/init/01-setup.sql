-- PostgreSQL Database Initialization for Local Development
-- This file is automatically executed when the Docker container starts for the first time

-- Create additional extensions that might be useful for development
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Grant additional permissions to the user (already created by POSTGRES_USER)
-- The user and database are automatically created by the postgres Docker image

-- Set timezone for consistency
SET timezone = 'UTC';

-- Log successful initialization
\echo 'Local development database initialized successfully!'
\echo 'Database: neemee'
\echo 'User: neemee_user'
\echo 'Extensions: uuid-ossp, pg_stat_statements'