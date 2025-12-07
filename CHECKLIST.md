# Setup and Deployment Checklist

## 🎯 Initial Setup

### Prerequisites
- [ ] Node.js v18+ installed (`node --version`)
- [ ] PostgreSQL v12+ installed (`psql --version`)
- [ ] PostgreSQL service running
- [ ] Git installed (optional, for version control)

### Installation Steps
1. [ ] Navigate to project directory
   ```bash
   cd /Users/markathas/Documents/git/formlessandvoid
   ```

2. [ ] Install dependencies (if not already done)
   ```bash
   npm install
   ```

3. [ ] Create PostgreSQL database
   ```bash
   createdb formlessandvoid
   ```
   Or via psql:
   ```sql
   CREATE DATABASE formlessandvoid;
   ```

4. [ ] Verify `.env.local` exists and is configured
   ```bash
   cat .env.local
   ```
   Should contain:
   - DATABASE_HOST
   - DATABASE_PORT
   - DATABASE_NAME
   - DATABASE_USER
   - DATABASE_PASSWORD
   - SITE_ROOT

5. [ ] Initialize database tables
   ```bash
   npm run db:init
   ```
   Expected output: "All models were synchronized successfully."

6. [ ] Seed sample data (optional but recommended for testing)
   ```bash
   npm run db:seed
   ```
   Expected output: "Database seeding completed successfully!"

---

## 🧪 Testing Locally

### Start Development Server
```bash
npm run dev
```
Expected: Server starts on http://localhost:3000

### Test Each Page

#### Home Page
- [ ] Visit http://localhost:3000
- [ ] Hero section displays correctly
- [ ] Feature cards show
- [ ] "View Available Surveys" button works
- [ ] Styling looks good (light colors, modern)

#### Navigation Bar
- [ ] Navbar shows "Formless and Void" branding
- [ ] "Home" link works
- [ ] "Surveys" dropdown appears
- [ ] "Customer Satisfaction" shows in dropdown (if seeded)
- [ ] "Contact" link works
- [ ] Navbar is responsive on mobile

#### Surveys List Page
- [ ] Visit http://localhost:3000/surveys
- [ ] Survey card(s) display
- [ ] "Customer Satisfaction Survey 2024" appears (if seeded)
- [ ] "Take Survey" button works

#### Survey Taking
- [ ] Click on a survey
- [ ] Survey title displays
- [ ] Progress bar shows
- [ ] First question appears
- [ ] "Back" button is disabled on first question
- [ ] "Next" button works

#### Question Types (from seed data)
- [ ] **Question 1**: Likert scale with 5 options displays
- [ ] **Question 2**: Yes/No radio buttons display
- [ ] **Question 3**: Multiple choice with 4 options displays
- [ ] **Question 4**: Multiple choice with "Other" option
  - [ ] Selecting "Other" shows text input
  - [ ] Text input accepts custom text
- [ ] **Question 5**: Text area displays

#### Navigation
- [ ] "Back" button works (returns to previous question)
- [ ] "Next" button works (moves to next question)
- [ ] Progress bar updates correctly
- [ ] Question counter shows (e.g., "Question 2 of 5")
- [ ] Can navigate back and forth multiple times
- [ ] Previous answers are preserved

#### Validation
- [ ] Leave Question 1 (required) blank
- [ ] Click "Next"
- [ ] Alert appears: "This question is required..."
- [ ] Cannot proceed without answering
- [ ] After answering, can proceed

#### Thank You Page
- [ ] After last question, clicking "Next" shows thank you page
- [ ] Thank you icon displays
- [ ] Email field is present and optional
- [ ] Can submit with email
- [ ] Can submit without email
- [ ] After submit, redirects to home (wait 3 seconds)

#### Contact Page
- [ ] Visit http://localhost:3000/contact
- [ ] Contact message displays
- [ ] Email link (later@company.com) works
- [ ] Styling is consistent with site

### Database Verification

Check data was saved:

```sql
-- Connect to database
psql formlessandvoid

-- Check respondents
SELECT respondent_id, status, ip_address, start_time 
FROM respondents 
ORDER BY created_at DESC 
LIMIT 5;

-- Check responses
SELECT r.respondent_id, sq.question_text, r.response_value, r.time_spent_seconds, r.visit_count
FROM responses r
JOIN survey_questions sq ON r.survey_question_id = sq.survey_question_id
ORDER BY r.created_at DESC
LIMIT 10;

-- Check completion
SELECT status, COUNT(*) 
FROM respondents 
GROUP BY status;
```

Expected results:
- [ ] Respondent record created
- [ ] Status progression: started → in-progress → completed
- [ ] Responses saved for each answered question
- [ ] Time tracking data present
- [ ] Visit counts are 1 or higher

---

## 🎨 Customization Testing

### Style Changes
1. [ ] Edit `app/globals.css`
2. [ ] Change `--accent-color` to a different color
3. [ ] Refresh browser
4. [ ] Buttons reflect new color
5. [ ] Revert changes

### Add Second Survey
1. [ ] Modify `scripts/seed.js` to create another survey
2. [ ] Run `npm run db:seed` again
3. [ ] Check surveys dropdown shows both
4. [ ] Both surveys are clickable and functional

---

## 🔍 Error Checking

### Check for Errors
```bash
# In the project
npm run lint
```

Expected:
- [ ] No critical errors
- [ ] Warnings (if any) are acceptable

### Check Console
- [ ] Open browser DevTools Console (F12)
- [ ] Navigate through app
- [ ] No red errors in console
- [ ] API calls succeed (check Network tab)

---

## 📦 Production Build Test

### Build Application
```bash
npm run build
```

Expected:
- [ ] Build completes successfully
- [ ] No errors during build
- [ ] `.next` folder created

### Test Production Build
```bash
npm start
```

Expected:
- [ ] Server starts
- [ ] All pages work
- [ ] All functionality works
- [ ] Performance is good

---

## 🚀 Deployment Preparation

### Environment Variables
- [ ] Create production `.env` file
- [ ] Update database credentials for production
- [ ] Update `SITE_ROOT` to production domain
- [ ] Secure sensitive values

### Security
- [ ] Review API routes for authentication (if needed)
- [ ] Consider rate limiting
- [ ] Plan for CAPTCHA (if needed)
- [ ] Review data privacy compliance

### Database
- [ ] Backup current database
  ```bash
  pg_dump formlessandvoid > backup.sql
  ```
- [ ] Plan production database setup
- [ ] Consider connection pooling settings
- [ ] Plan for backups and maintenance

### Hosting Options
Choose and prepare:
- [ ] **Vercel** (easiest for Next.js)
  - Connect GitHub repo
  - Add environment variables
  - Deploy automatically

- [ ] **AWS**
  - Set up EC2 instance
  - Set up RDS PostgreSQL
  - Configure security groups
  - Deploy application

- [ ] **DigitalOcean**
  - Create App Platform app
  - Create Managed Database
  - Connect and deploy

- [ ] **Heroku**
  - Create new app
  - Add PostgreSQL add-on
  - Push code
  - Run migrations

---

## 📊 Post-Deployment Testing

After deployment:

- [ ] Visit production URL
- [ ] Test all pages
- [ ] Take a complete survey
- [ ] Verify data saves to production database
- [ ] Test on mobile device
- [ ] Test on different browsers
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Check performance (loading speed)
- [ ] Monitor for errors

---

## 📈 Monitoring Setup

### Application Monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Set up analytics (e.g., Google Analytics)
- [ ] Monitor API response times
- [ ] Set up uptime monitoring

### Database Monitoring
- [ ] Monitor database connections
- [ ] Set up automated backups
- [ ] Monitor disk space
- [ ] Monitor query performance

---

## 📚 Documentation Review

Final checks:
- [ ] README.md is accurate
- [ ] QUICKSTART.md tested
- [ ] DATABASE.md reflects actual schema
- [ ] All commands in docs work
- [ ] Contact email is correct

---

## 🎓 Knowledge Transfer

For handoff to team:
- [ ] Demo the application
- [ ] Walk through code structure
- [ ] Explain database schema
- [ ] Show how to create surveys manually (until admin app exists)
- [ ] Document any customizations made
- [ ] Share credentials securely
- [ ] Provide support contact info

---

## ✅ Final Verification

Everything complete:
- [ ] Application runs locally without errors
- [ ] All features work as specified
- [ ] Database is properly set up
- [ ] Documentation is complete
- [ ] Code is clean and commented
- [ ] Ready for deployment or further development

---

## 📞 Support

If any step fails or you have questions:

1. Check the relevant documentation file
2. Review error messages carefully
3. Check database connection
4. Verify environment variables
5. Contact: later@company.com

---

## 🎉 Success Criteria

You've successfully completed setup when:

✅ Development server runs without errors  
✅ You can view the home page  
✅ You can see survey list  
✅ You can take a complete survey  
✅ Responses save to database  
✅ All question types work  
✅ Navigation works properly  
✅ Thank you page appears  
✅ Data is tracked correctly  

**Status**: Ready for use! 🚀

