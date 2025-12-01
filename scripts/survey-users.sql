CREATE USER surveyapp WITH PASSWORD 'securepassword';
GRANT INSERT, SELECT, UPDATE ON TABLE surveys TO appsurvey;
GRANT INSERT, SELECT, UPDATE ON TABLE survey_questions TO appsurvey;
GRANT INSERT, SELECT, UPDATE ON TABLE survey_respondents TO appsurvey;
GRANT INSERT, SELECT, UPDATE ON TABLE survey_responses TO appsurvey;
GRANT USAGE ON SCHEMA public to appsurvey;
REVOKE postgres from appsurvey;

CREATE ROLE appsurvey WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    INHERIT
    NOREPLICATION
    NOBYPASSRLS
    CONNECTION LIMIT -1
    PASSWORD 'xxxxxx';

GRANT appsurvey TO pg_write_all_data, pg_read_all_data;
