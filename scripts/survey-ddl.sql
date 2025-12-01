CREATE TABLE surveys
(id UUID PRIMARY KEY,
 title VARCHAR(255) NOT NULL,
 description TEXT,
 isActive SMALLINT DEFAULT 0,
 startDate TIMESTAMP,
 endDate TIMESTAMP,
 thankYouMessage TEXT DEFAULT 'Thank you for completing our survey!',
 thankYouEmailSubject VARCHAR(255) DEFAULT 'Thank you for your participation',
 thankYouEmailBody TEXT DEFAULT 'Thank you for taking the time to complete our survey. Your responses are valuable to us.',
 createdBy VARCHAR(255),
 createdAt TIMESTAMP NOT NULL,
 updatedAt TIMESTAMP NOT NULL);

CREATE TABLE survey_questions
(id SERIAL PRIMARY KEY,
 surveyId UUID NOT NULL REFERENCES surveys (id) ON DELETE CASCADE ON UPDATE CASCADE,
 questionText TEXT NOT NULL,
 questionType TEXT NOT NULL,
 options JSON,
 isRequired SMALLINT DEFAULT 1,
 orderIndex INTEGER DEFAULT 0,
 helpText TEXT,
 createdAt TIMESTAMP NOT NULL,
 updatedAt TIMESTAMP NOT NULL);

CREATE TABLE survey_respondents
(id SERIAL PRIMARY KEY,
 surveyId UUID NOT NULL REFERENCES surveys (id) ON DELETE CASCADE ON UPDATE CASCADE,
 email VARCHAR(255),
 sessionId VARCHAR(255) NOT NULL UNIQUE,
 isCompleted SMALLINT DEFAULT 0,
 completedAt TIMESTAMP,
 ipAddress VARCHAR(255),
 userAgent TEXT,
 thankYouEmailSent SMALLINT DEFAULT 0,
 createdAt TIMESTAMP NOT NULL,
 updatedAt TIMESTAMP NOT NULL);

CREATE TABLE survey_responses
(id SERIAL PRIMARY KEY,
surveyId UUID NOT NULL REFERENCES surveys (id) ON DELETE CASCADE ON UPDATE CASCADE,
 respondentId INTEGER NOT NULL REFERENCES survey_respondents (id) ON DELETE CASCADE ON UPDATE CASCADE,
 questionId INTEGER NOT NULL REFERENCES survey_questions (id) ON DELETE CASCADE ON UPDATE CASCADE,
 responseValue TEXT,
 responseData TEXT,
 createdAt TIMESTAMP NOT NULL,
 updatedAt TIMESTAMP NOT NULL);



-- DROP TABLE IF EXISTS responses;
-- DROP TABLE survey_responses CASCADE;
-- DROP TABLE survey_respondents  CASCADE;
-- DROP TABLE survey_questions  CASCADE;
-- DROP TABLE surveys CASCADE;


