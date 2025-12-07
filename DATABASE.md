# Database Schema Documentation

## Overview

The Formless and Void survey platform uses PostgreSQL with Sequelize ORM. The schema consists of 4 main tables with relationships designed to track surveys, questions, respondents, and their responses.

## Entity Relationship Diagram

```
┌─────────────────┐
│    surveys      │
│─────────────────│
│ survey_id (PK)  │◄──────┐
│ short_name      │       │
│ full_name       │       │
│ description     │       │
│ is_active       │       │
│ is_public       │       │
│ start_date      │       │
│ end_date        │       │
│ has_responses   │       │
│ created_at      │       │
│ updated_at      │       │
└─────────────────┘       │
         │                │
         │                │
         ▼                │
┌─────────────────────┐   │
│  survey_questions   │   │
│─────────────────────│   │
│ survey_question_id  │   │
│   (PK)              │   │
│ survey_id (FK)      │───┘
│ sequence_number     │
│ question_text       │
│ item_type           │
│ is_required         │
│ options (JSONB)     │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │
         │
         │            ┌──────────────────┐
         │            │   respondents    │
         │            │──────────────────│
         │            │ respondent_id    │
         │            │   (PK)           │
         │      ┌─────┤ survey_id (FK)   │
         │      │     │ ip_address       │
         │      │     │ email            │
         │      │     │ status           │
         │      │     │ start_time       │
         │      │     │ submit_time      │
         │      │     │ total_time_      │
         │      │     │   seconds        │
         │      │     │ created_at       │
         │      │     │ updated_at       │
         │      │     └──────────────────┘
         │      │              │
         │      │              │
         └──────┼──────────────┘
                │
                ▼
         ┌──────────────────┐
         │    responses     │
         │──────────────────│
         │ response_id (PK) │
         │ respondent_id    │
         │   (FK)           │
         │ survey_question_ │
         │   id (FK)        │
         │ response_value   │
         │ time_spent_      │
         │   seconds        │
         │ visit_count      │
         │ created_at       │
         │ updated_at       │
         └──────────────────┘
```

## Table Specifications

### 1. surveys

Stores survey metadata and configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| survey_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique survey identifier |
| short_name | VARCHAR(100) | NOT NULL | Brief name shown in dropdown |
| full_name | VARCHAR(255) | NOT NULL | Full descriptive name |
| description | TEXT | NULL | Survey description/purpose |
| is_active | BOOLEAN | DEFAULT true | Whether survey accepts responses |
| is_public | BOOLEAN | DEFAULT true | Public vs private access |
| start_date | TIMESTAMP | NULL | Optional survey start date |
| end_date | TIMESTAMP | NULL | Optional survey end date |
| has_responses | BOOLEAN | DEFAULT false | Locked after first response |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes:**
- Primary key on `survey_id`

**Business Rules:**
- Cannot be modified if `has_responses = true`
- Only shown if `is_active = true` and within date range
- Only listed in public menu if `is_public = true`

---

### 2. survey_questions

Stores individual questions for each survey.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| survey_question_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique question identifier |
| survey_id | UUID | FK → surveys(survey_id), NOT NULL | Parent survey |
| sequence_number | INTEGER | NOT NULL | Display order |
| question_text | TEXT | NOT NULL | The question prompt |
| item_type | ENUM | NOT NULL | Question type (see below) |
| is_required | BOOLEAN | DEFAULT false | Must be answered |
| options | JSONB | NULL | Type-specific configuration |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Item Types:**
- `text` - Open-ended text response
- `yes-no` - Binary choice
- `likert` - Rating scale (1-5 or custom)
- `multiple-choice` - Select one from options
- `multiple-other` - Multiple choice + "Other" text field

**Options JSON Structure:**

For `likert`:
```json
{
  "scale": [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree"
  ]
}
```

For `multiple-choice` and `multiple-other`:
```json
{
  "choices": [
    "Option 1",
    "Option 2",
    "Option 3"
  ]
}
```

**Indexes:**
- Primary key on `survey_question_id`
- Composite index on `(survey_id, sequence_number)`

**Relationships:**
- Many-to-One with `surveys`

---

### 3. respondents

Tracks individuals taking surveys.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| respondent_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique respondent identifier |
| survey_id | UUID | FK → surveys(survey_id), NOT NULL | Survey being taken |
| ip_address | VARCHAR(45) | NULL | IPv4 or IPv6 address |
| email | VARCHAR(255) | NULL | Optional contact email |
| status | ENUM | DEFAULT 'started' | Progress status (see below) |
| start_time | TIMESTAMP | NOT NULL, DEFAULT NOW() | When survey opened |
| submit_time | TIMESTAMP | NULL | When survey completed |
| total_time_seconds | INTEGER | NULL | Total completion time |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Status Values:**
- `started` - Landed on survey page
- `in-progress` - Answered at least one question
- `completed` - Submitted survey

**Indexes:**
- Primary key on `respondent_id`

**Relationships:**
- Many-to-One with `surveys`
- One-to-Many with `responses`

**Business Rules:**
- New respondent created for each survey attempt
- `total_time_seconds` calculated as `submit_time - start_time`
- Email stored separately from responses for privacy

---

### 4. responses

Stores answers to individual questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| response_id | UUID | PK, DEFAULT uuid_generate_v4() | Unique response identifier |
| respondent_id | UUID | FK → respondents(respondent_id), NOT NULL | Who answered |
| survey_question_id | UUID | FK → survey_questions(survey_question_id), NOT NULL | Which question |
| response_value | TEXT | NULL | The actual answer |
| time_spent_seconds | INTEGER | DEFAULT 0 | Time on question |
| visit_count | INTEGER | DEFAULT 1 | Times visited question |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes:**
- Primary key on `response_id`
- Composite index on `(respondent_id, survey_question_id)`

**Relationships:**
- Many-to-One with `respondents`
- Many-to-One with `survey_questions`

**Response Value Format:**

Stored as text but semantically typed by question:

- `text`: Full text response
- `yes-no`: "Yes" or "No"
- `likert`: Selected scale value
- `multiple-choice`: Selected option
- `multiple-other`: Selected option OR custom text

**Business Rules:**
- Updated if respondent revisits question
- `visit_count` incremented on each visit
- `time_spent_seconds` accumulated across visits

---

## Database Initialization

### Create Database

```sql
CREATE DATABASE formlessandvoid;
```

### Run Migrations

```bash
npm run db:init
```

This executes Sequelize sync which:
1. Creates all tables
2. Establishes foreign keys
3. Creates indexes
4. Sets up ENUM types

---

## Sample Queries

### Get All Active Public Surveys

```sql
SELECT survey_id, short_name, full_name, description
FROM surveys
WHERE is_active = true
  AND is_public = true
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
ORDER BY created_at DESC;
```

### Get Survey with Questions

```sql
SELECT 
  s.survey_id,
  s.full_name,
  sq.survey_question_id,
  sq.sequence_number,
  sq.question_text,
  sq.item_type,
  sq.is_required,
  sq.options
FROM surveys s
LEFT JOIN survey_questions sq ON s.survey_id = sq.survey_id
WHERE s.survey_id = 'your-survey-id'
ORDER BY sq.sequence_number;
```

### Get Survey Response Rate

```sql
SELECT 
  survey_id,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE status = 'started') as started,
  COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*),
    2
  ) as completion_rate
FROM respondents
GROUP BY survey_id;
```

### Get All Responses for a Respondent

```sql
SELECT 
  sq.sequence_number,
  sq.question_text,
  sq.item_type,
  r.response_value,
  r.time_spent_seconds,
  r.visit_count
FROM responses r
JOIN survey_questions sq ON r.survey_question_id = sq.survey_question_id
WHERE r.respondent_id = 'your-respondent-id'
ORDER BY sq.sequence_number;
```

### Average Time Per Question

```sql
SELECT 
  sq.question_text,
  sq.item_type,
  COUNT(r.response_id) as response_count,
  ROUND(AVG(r.time_spent_seconds), 2) as avg_seconds,
  ROUND(AVG(r.visit_count), 2) as avg_visits
FROM survey_questions sq
LEFT JOIN responses r ON sq.survey_question_id = r.survey_question_id
WHERE sq.survey_id = 'your-survey-id'
GROUP BY sq.survey_question_id, sq.question_text, sq.item_type
ORDER BY sq.sequence_number;
```

---

## Data Integrity Rules

### Foreign Key Constraints

1. `survey_questions.survey_id` → `surveys.survey_id`
   - Cascade: None (don't delete surveys with questions)
   
2. `respondents.survey_id` → `surveys.survey_id`
   - Cascade: None (preserve historical data)
   
3. `responses.respondent_id` → `respondents.respondent_id`
   - Cascade: Delete (remove responses if respondent removed)
   
4. `responses.survey_question_id` → `survey_questions.survey_question_id`
   - Cascade: None (preserve responses)

### Check Constraints

- `sequence_number` must be positive
- `time_spent_seconds` must be non-negative
- `visit_count` must be positive
- `end_date` must be after `start_date` if both set

---

## Backup and Maintenance

### Backup Commands

```bash
# Backup entire database
pg_dump formlessandvoid > backup.sql

# Backup specific tables
pg_dump formlessandvoid -t surveys -t survey_questions > surveys_backup.sql

# Restore
psql formlessandvoid < backup.sql
```

### Maintenance

```sql
-- Analyze tables for query optimization
ANALYZE surveys;
ANALYZE survey_questions;
ANALYZE respondents;
ANALYZE responses;

-- Vacuum to reclaim space
VACUUM ANALYZE;
```

---

## Performance Considerations

### Recommended Indexes (Already Created)

- `surveys(survey_id)` - Primary key
- `survey_questions(survey_id, sequence_number)` - Composite for ordering
- `respondents(survey_id)` - For survey analytics
- `responses(respondent_id, survey_question_id)` - For response lookup

### Additional Indexes for Analytics (Optional)

```sql
-- For status-based queries
CREATE INDEX idx_respondents_status ON respondents(status);

-- For date range queries
CREATE INDEX idx_surveys_dates ON surveys(start_date, end_date) 
WHERE is_active = true;

-- For response value searches
CREATE INDEX idx_responses_value ON responses 
USING gin(to_tsvector('english', response_value));
```

### Connection Pooling

Configure in `lib/db.js`:

```javascript
pool: {
  max: 5,        // Maximum connections
  min: 0,        // Minimum connections
  acquire: 30000, // Max time to get connection
  idle: 10000    // Max idle time
}
```

---

## Security Considerations

1. **IP Address Storage**: Hashed or anonymized in production
2. **Email Privacy**: Stored separately, never in exports
3. **SQL Injection**: Protected by Sequelize parameterization
4. **Data Access**: Implement row-level security for multi-tenancy
5. **Audit Trail**: All tables have `created_at` and `updated_at`

---

## Migration Strategy

For schema changes after deployment:

1. Never drop columns with data
2. Add new columns as nullable first
3. Use Sequelize migrations for version control
4. Test migrations on backup before production
5. Keep backward compatibility for 2 versions

---

This schema supports the complete survey lifecycle from creation through response collection and analysis.

