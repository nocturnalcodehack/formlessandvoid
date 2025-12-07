# Formless and Void - File Structure

```
formlessandvoid/
│
├── 📋 Documentation
│   ├── README.md                    # Complete project documentation
│   ├── QUICKSTART.md               # Quick setup guide
│   ├── DATABASE.md                 # Database schema details
│   ├── PROJECT_COMPLETE.md         # Implementation summary
│   └── ai-prompt.md                # Original requirements
│
├── ⚙️ Configuration
│   ├── .env.example                # Environment template
│   ├── .env.local                  # Local environment (git-ignored)
│   ├── .eslintrc.json             # ESLint configuration
│   ├── .gitignore                 # Git ignore rules
│   ├── eslint.config.mjs          # Additional ESLint config
│   ├── jsconfig.json              # JavaScript config
│   ├── next.config.js             # Next.js configuration
│   ├── package.json               # Dependencies & scripts
│   ├── package-lock.json          # Locked dependencies
│   └── startup.sh                 # Quick start script
│
├── 🎨 Application (app/)
│   │
│   ├── 🌐 Pages
│   │   ├── layout.js              # Root layout with navbar
│   │   ├── page.js                # Home page (/)
│   │   ├── globals.css            # Global styles
│   │   │
│   │   ├── contact/
│   │   │   └── page.js            # Contact page (/contact)
│   │   │
│   │   ├── surveys/
│   │   │   └── page.js            # Surveys list (/surveys)
│   │   │
│   │   └── survey/
│   │       └── [id]/
│   │           └── page.js        # Dynamic survey (/survey/:id)
│   │
│   └── 🔌 API Routes (api/)
│       │
│       ├── surveys/
│       │   ├── route.js           # GET /api/surveys (list)
│       │   └── [id]/
│       │       └── route.js       # GET /api/surveys/:id (details)
│       │
│       ├── respondents/
│       │   ├── route.js           # POST /api/respondents (create)
│       │   └── [id]/
│       │       └── route.js       # PATCH /api/respondents/:id (update)
│       │
│       ├── responses/
│       │   └── route.js           # POST /api/responses (save answer)
│       │
│       └── submit/
│           └── route.js           # POST /api/submit (complete survey)
│
├── 🧩 Components (components/)
│   ├── Navbar.js                  # Top navigation bar
│   ├── SurveyTaker.js            # Main survey logic & state
│   ├── QuestionRenderer.js        # Renders all question types
│   └── ThankYouPage.js           # Final submission page
│
├── 🗄️ Database (models/)
│   ├── index.js                   # Model exports & initialization
│   ├── Survey.js                  # Survey model
│   ├── SurveyQuestion.js         # Question model
│   ├── Respondent.js             # Respondent model
│   └── Response.js               # Response model
│
├── 🔧 Utilities (lib/)
│   └── db.js                      # Database connection
│
└── 📜 Scripts (scripts/)
    ├── init-db.js                 # Initialize database tables
    └── seed.js                    # Seed sample survey data
```

## File Counts

- **Total Files**: 41
- **JavaScript**: 24 (.js)
- **Documentation**: 5 (.md)
- **Configuration**: 8 (various)
- **Styles**: 1 (.css)
- **Scripts**: 3 (.sh, .js)

## Component Hierarchy

```
App
└── Layout
    ├── Navbar
    └── Main Content
        │
        ├── Home Page
        │   └── Feature Cards
        │
        ├── Surveys List Page
        │   └── Survey Cards
        │
        ├── Survey Page
        │   └── SurveyTaker
        │       ├── Progress Bar
        │       ├── QuestionRenderer
        │       │   ├── Text Input
        │       │   ├── Yes/No Radio
        │       │   ├── Likert Scale
        │       │   ├── Multiple Choice
        │       │   └── Multiple + Other
        │       ├── Navigation Buttons
        │       └── ThankYouPage
        │           └── Email Form
        │
        └── Contact Page
            └── Contact Card
```

## API Flow

```
User Actions                API Endpoints               Database
────────────────────────────────────────────────────────────────

1. Browse surveys
   GET /surveys          →  /api/surveys          →  SELECT surveys
   ↓
2. Click survey
   GET /survey/:id       →  /api/surveys/:id      →  SELECT survey + questions
   ↓
3. Start survey
   (automatic)           →  /api/respondents      →  INSERT respondent
   ↓
4. Answer questions
   (each answer)         →  /api/responses        →  INSERT/UPDATE response
   ↓
5. Update status
   (first answer)        →  /api/respondents/:id  →  UPDATE status
   ↓
6. Submit survey
   (final page)          →  /api/submit           →  UPDATE respondent
                                                       UPDATE survey.has_responses
```

## Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Next.js    │
│  Pages      │  (Server-Side Rendering)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  API Routes │  (Server-Side API)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Sequelize  │  (ORM)
│  Models     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ PostgreSQL  │  (Database)
└─────────────┘
```

## Question Type Rendering

```
QuestionRenderer Component
│
├── Text Type
│   └── <textarea>
│
├── Yes-No Type
│   └── <radio> x 2
│       ├── Yes
│       └── No
│
├── Likert Type
│   └── <radio> x 5
│       ├── Strongly Disagree
│       ├── Disagree
│       ├── Neutral
│       ├── Agree
│       └── Strongly Agree
│
├── Multiple Choice Type
│   └── <radio> x n
│       ├── Option 1
│       ├── Option 2
│       └── ...
│
└── Multiple + Other Type
    ├── <radio> x n
    │   ├── Option 1
    │   ├── Option 2
    │   ├── ...
    │   └── Other
    └── <input> (conditional)
        └── Shows when "Other" selected
```

## State Management

```
SurveyTaker Component State
│
├── survey                    # Survey data with questions
├── respondentId             # Current session ID
├── currentQuestionIndex     # Which question showing
├── responses                # Map of answers
├── visitCounts              # Visit tracking
├── questionStartTime        # For timing
├── loading                  # Loading state
├── error                    # Error state
└── showThankYou            # Final page toggle
```

## Styling System

```
Global Styles (globals.css)
│
├── CSS Variables
│   ├── --primary-bg
│   ├── --secondary-bg
│   ├── --accent-color
│   └── ...
│
├── Component Classes
│   ├── .survey-container
│   ├── .question-card
│   ├── .likert-scale
│   ├── .choice-option
│   ├── .survey-navigation
│   └── ...
│
├── Bootstrap Integration
│   └── Bootstrap 5 classes
│
└── Responsive Breakpoints
    └── @media queries
```

## Database Tables

```
surveys (Parent)
│
├── survey_questions (Child)
│   │
│   └── responses (Grandchild)
│       └── Links to respondents
│
└── respondents (Child)
    │
    └── responses (Grandchild)
        └── Links to survey_questions
```

## Development Workflow

```
1. Code Changes
   ↓
2. npm run dev (Auto-reload)
   ↓
3. Test in Browser
   ↓
4. Check API responses
   ↓
5. Verify Database
   ↓
6. Repeat
```

## Production Build

```
1. npm run build
   ↓
2. Optimization
   ├── Minification
   ├── Tree-shaking
   ├── Image optimization
   └── Code splitting
   ↓
3. .next/ folder created
   ↓
4. npm start (Production server)
```

---

This structure provides clear separation of concerns:
- **Pages** handle routing and UI
- **Components** provide reusable UI elements
- **API Routes** handle business logic
- **Models** manage data access
- **Scripts** provide utilities

Everything is organized for easy maintenance and scalability.

