# Formless and Void - Survey Delivery Platform

An interactive survey delivery website built with Next.js, React, Bootstrap, Sequelize, and PostgreSQL.

## Features

- 🎯 Modern, pleasant light-colored UI
- 📊 Support for multiple question types:
  - Text (open-ended)
  - Yes/No
  - Likert scales
  - Multiple choice
  - Multiple choice with "Other" option
- ⏱️ Track time spent on each question
- 📈 Progress tracking through surveys
- 🔒 Support for both public and private surveys
- 📧 Optional email collection
- 🎨 Responsive design with Bootstrap

## Tech Stack

- **Frontend**: Next.js 14, React 18, Bootstrap 5
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Styling**: Bootstrap + Custom CSS

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd formlessandvoid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE formlessandvoid;
   ```

4. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and update with your database credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env.local`:
   ```env
   DATABASE_URL=postgresql://localhost:5432/formlessandvoid
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=formlessandvoid
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   SITE_ROOT=http://localhost:3000
   ```

5. **Initialize the database**
   ```bash
   npm run db:init
   ```

6. **Seed the database with sample data** (optional)
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development mode
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production mode
```bash
npm run build
npm start
```

## Project Structure

```
formlessandvoid/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── surveys/       # Survey endpoints
│   │   ├── respondents/   # Respondent endpoints
│   │   ├── responses/     # Response endpoints
│   │   └── submit/        # Survey submission
│   ├── contact/           # Contact page
│   ├── survey/[id]/       # Dynamic survey page
│   ├── surveys/           # Surveys list page
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navbar.js          # Navigation bar
│   ├── QuestionRenderer.js # Question type renderer
│   ├── SurveyTaker.js     # Main survey component
│   └── ThankYouPage.js    # Thank you page
├── lib/                   # Utilities
│   └── db.js             # Database connection
├── models/                # Sequelize models
│   ├── Survey.js
│   ├── SurveyQuestion.js
│   ├── Respondent.js
│   ├── Response.js
│   └── index.js
├── scripts/               # Database scripts
│   ├── init-db.js        # Initialize database
│   └── seed.js           # Seed sample data
└── package.json
```

## Database Schema

### Tables

1. **surveys**
   - surveyId (UUID, PK)
   - shortName
   - fullName
   - description
   - isActive
   - isPublic
   - startDate
   - endDate
   - hasResponses

2. **survey_questions**
   - surveyQuestionId (UUID, PK)
   - surveyId (FK)
   - sequenceNumber
   - questionText
   - itemType (text, yes-no, likert, multiple-choice, multiple-other)
   - isRequired
   - options (JSONB)

3. **respondents**
   - respondentId (UUID, PK)
   - surveyId (FK)
   - ipAddress
   - email
   - status (started, in-progress, completed)
   - startTime
   - submitTime
   - totalTimeSeconds

4. **responses**
   - responseId (UUID, PK)
   - respondentId (FK)
   - surveyQuestionId (FK)
   - responseValue
   - timeSpentSeconds
   - visitCount

## Usage

### For Survey Respondents

1. Visit the home page
2. Navigate to "Surveys" in the navbar
3. Select a survey from the dropdown or list
4. Answer questions one at a time
5. Use "Back" and "Next" buttons to navigate
6. Optionally provide your email on the thank you page
7. Submit the survey

### Survey Features

- **Required Questions**: Must be answered before proceeding
- **Optional Questions**: Can be skipped
- **Navigation**: Back and forward through questions
- **Progress Tracking**: Visual progress bar
- **Time Tracking**: Automatic tracking of time spent on each question
- **Visit Counting**: Tracks how many times a question is visited

## API Endpoints

- `GET /api/surveys` - Get all active public surveys
- `GET /api/surveys/[id]` - Get survey details with questions
- `POST /api/respondents` - Create a new respondent
- `PATCH /api/respondents/[id]` - Update respondent status
- `POST /api/responses` - Save a question response
- `POST /api/submit` - Submit completed survey

## Customization

### Styling

The application uses CSS variables for easy theming. Edit `app/globals.css`:

```css
:root {
  --primary-bg: #f8f9fa;
  --secondary-bg: #e9ecef;
  --accent-color: #0d6efd;
  /* ... more variables */
}
```

### Adding New Question Types

1. Update the `itemType` enum in `models/SurveyQuestion.js`
2. Add rendering logic in `components/QuestionRenderer.js`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | Full PostgreSQL connection string | - |
| DATABASE_HOST | Database host | localhost |
| DATABASE_PORT | Database port | 5432 |
| DATABASE_NAME | Database name | formlessandvoid |
| DATABASE_USER | Database user | postgres |
| DATABASE_PASSWORD | Database password | - |
| SITE_ROOT | Base URL of the site | http://localhost:3000 |

## Notes

- Surveys cannot be modified after receiving at least one response
- Each survey session creates a new respondent record
- IP addresses are collected for analytics
- Email addresses are optional and stored separately

## Future Enhancements

- Survey administration interface (separate application)
- Data export functionality
- Advanced analytics
- Multi-language support
- Survey branching/logic
- File upload questions

## License

This project is proprietary software.

## Support

For questions or issues, contact: later@company.com

