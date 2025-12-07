# Quick Start Guide - Formless and Void

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js installed (v18+): `node --version`
- [ ] PostgreSQL installed (v12+): `psql --version`
- [ ] PostgreSQL running: Check your system

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create PostgreSQL Database

Open your PostgreSQL client and run:
```sql
CREATE DATABASE formlessandvoid;
```

Or via command line:
```bash
createdb formlessandvoid
```

### 3. Configure Environment

The `.env.local` file should already exist. Update it with your database credentials:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=formlessandvoid
DATABASE_USER=your_postgres_username
DATABASE_PASSWORD=your_postgres_password
SITE_ROOT=http://localhost:3000
```

### 4. Initialize Database Tables

```bash
npm run db:init
```

This creates all necessary tables with proper relationships.

### 5. Add Sample Data (Optional)

```bash
npm run db:seed
```

This creates a sample "Customer Satisfaction Survey" with 5 questions demonstrating all question types.

### 6. Start Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## Testing the Application

1. **Home Page** (`/`)
   - View welcome message and features

2. **Surveys List** (`/surveys`)
   - See all available public surveys
   - Or click "Surveys" dropdown in navbar

3. **Take a Survey** (`/survey/[id]`)
   - Click on any survey
   - Answer questions one by one
   - Use Back/Next navigation
   - Submit with optional email

4. **Contact Page** (`/contact`)
   - View contact information

## Sample Survey Questions

The seeded survey includes:

1. **Likert Scale**: "How satisfied are you with our service?"
2. **Yes/No**: "Would you recommend us to a friend?"
3. **Multiple Choice**: "What type of customer are you?"
4. **Multiple Choice + Other**: "How did you hear about us?"
5. **Text**: "Please share any additional feedback"

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U your_username -d formlessandvoid

# If connection refused, start PostgreSQL
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql
```

### Port Already in Use

If port 3000 is busy:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

### Database Schema Issues

```bash
# Drop and recreate database
dropdb formlessandvoid
createdb formlessandvoid
npm run db:init
npm run db:seed
```

## Next Steps

### Creating Your Own Survey

You'll need the survey administration application (separate project) to:
- Create new surveys
- Add questions
- Configure options
- Activate/deactivate surveys
- View responses

For now, you can manually add surveys to the database or modify the seed script.

### Manual Survey Creation

Connect to PostgreSQL:
```sql
-- Create a survey
INSERT INTO surveys (survey_id, short_name, full_name, description, is_active, is_public)
VALUES (gen_random_uuid(), 'My Survey', 'My First Survey', 'Description here', true, true);

-- Add questions (replace survey_id with your UUID)
INSERT INTO survey_questions 
(survey_question_id, survey_id, sequence_number, question_text, item_type, is_required)
VALUES 
(gen_random_uuid(), 'your-survey-id-here', 1, 'What is your name?', 'text', true);
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Update `.env.local` for production:
- Use production database credentials
- Update `SITE_ROOT` to your domain
- Consider using connection pooling
- Enable SSL for database connection

### Recommended Hosting

- **Vercel**: Native Next.js support
- **AWS**: EC2 + RDS PostgreSQL
- **DigitalOcean**: App Platform + Managed Database
- **Heroku**: Easy deployment with PostgreSQL add-on

## Support

Questions? Email: later@company.com

## Common Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run linting

# Database
npm run db:init         # Initialize database tables
npm run db:seed         # Seed sample data

# Maintenance
npm install             # Install dependencies
npm update              # Update dependencies
npm audit fix           # Fix security vulnerabilities
```

Happy surveying! 🎉

