## Multiple Choice Question Issues - Fixed

### Issues Found:

1. **Rendering Issue**: Questions with options stored as arrays directly (e.g., `["a", "b", "c"]`) instead of objects (e.g., `{choices: ["a", "b", "c"]}`) were not rendering properly.

2. **Saving Issue**: Array values from multiselect questions needed to be serialized to JSON strings before saving to the TEXT database column.

### Fixes Applied:

#### 1. QuestionRenderer.js
- Updated all question type handlers (multiple-choice, multiple-other, multiselect, multiselect-other, likert) to handle BOTH formats:
  - Array format: `["option1", "option2"]`
  - Object format: `{choices: ["option1", "option2"]}` or `{scale: ["option1", "option2"]}`
- Now checks if options is an array first, otherwise looks for choices/scale property

#### 2. SurveyTaker.js
- Added JSON serialization for array values before saving:
  ```javascript
  const serializedValue = Array.isArray(value) ? JSON.stringify(value) : value;
  ```
- Fixed empty value handling to preserve empty arrays for multiselect questions
- Added `isEmptyAnswer()` helper to properly validate arrays

#### 3. Survey API Route (app/api/surveys/[id]/route.js)
- Fixed question ordering in the Sequelize query

### Additional Scripts Created:

1. **scripts/fix-options-format.js** - Migration script to convert array-format options to proper object format in the database
2. **scripts/test-survey.js** - Utility to inspect survey data structure

### Testing:

To test the fixes:

1. Questions with array-format options will now render correctly
2. Multiple choice selections will be saved properly
3. Multiselect arrays will be serialized as JSON strings in the database
4. Both old (array) and new (object) format options are supported

### Database Schema Note:

The `options` column in `survey_questions` table should store data as:
- For multiple-choice/multiselect: `{choices: ["option1", "option2", ...]}`
- For likert: `{scale: ["option1", "option2", ...]}`
- For yes-no/text: `null`

Response values for multiselect questions are stored as JSON strings in the `response_value` TEXT column.

