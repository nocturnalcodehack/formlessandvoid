# "Other" Response Format Documentation

## Overview
When a survey question includes an "Other" option (in `multiple-other` or `multiselect-other` question types), the response is saved in a special JSON format that distinguishes it from standard choices and preserves the custom text entered by the user.

## Question Types with "Other" Support

### 1. multiple-other
A single-select question with predefined choices plus an "Other" option with text input.

### 2. multiselect-other
A multi-select question with predefined choices plus an "Other" option with text input.

## Response Format

### multiple-other Responses

**Standard Choice Selected:**
```json
"Red"
```
- Saved as a plain string in the `response_value` column

**Other Selected:**
```json
{
  "choice": "Other",
  "value": "Purple with pink stripes"
}
```
- Saved as a JSON object in the `response_value` column
- `choice`: Always set to "Other" to identify this as an "Other" response
- `value`: The custom text entered by the user

### multiselect-other Responses

**Standard Choices Only:**
```json
["Red", "Blue", "Green"]
```
- Saved as a JSON array of strings in the `response_value` column

**Standard Choices + Other:**
```json
["Red", "Blue", {"choice": "Other", "value": "Purple with pink stripes"}]
```
- Saved as a JSON array containing both strings and an object
- Standard choices are plain strings
- The "Other" response is a JSON object with `choice` and `value` properties

**Only Other Selected:**
```json
[{"choice": "Other", "value": "Purple with pink stripes"}]
```
- Array with a single object element

## Data Retrieval and Processing

### Parsing Responses

```javascript
// Example: Parse a multiple-other response
const responseValue = row.response_value;

let parsedValue;
try {
  // Try to parse as JSON first
  parsedValue = JSON.parse(responseValue);
} catch (e) {
  // If it's not JSON, it's a plain string
  parsedValue = responseValue;
}

// Check if it's an "Other" response
if (typeof parsedValue === 'object' && parsedValue.choice === 'Other') {
  console.log('User selected Other and entered:', parsedValue.value);
} else {
  console.log('User selected:', parsedValue);
}
```

### Parsing multiselect-other Responses

```javascript
// Example: Parse a multiselect-other response
const responseValue = row.response_value;
const selections = JSON.parse(responseValue);

selections.forEach(item => {
  if (typeof item === 'object' && item.choice === 'Other') {
    console.log('Other response:', item.value);
  } else {
    console.log('Standard choice:', item);
  }
});
```

## Database Schema

The `response_value` column in the `responses` table is of type `TEXT`, which can store:
- Plain strings for simple text or single-choice responses
- JSON strings for arrays (multiselect) or objects (other responses)

## Analytics Considerations

When analyzing survey results:

1. **Standard Choices**: Count occurrences of plain string values
2. **Other Responses**: 
   - Identify by checking for `{choice: "Other", value: "..."}` pattern
   - Group "Other" responses as a category
   - Analyze the `value` field for qualitative insights
3. **Mixed Arrays**: For multiselect-other, separate standard choices from "Other" entries

## Example Queries

### Count responses by choice (PostgreSQL):

```sql
-- For multiple-choice (standard)
SELECT response_value, COUNT(*) 
FROM responses 
WHERE survey_question_id = 'xxx'
GROUP BY response_value;

-- For multiple-other (separate standard from Other)
SELECT 
  CASE 
    WHEN response_value::json ? 'choice' THEN 'Other'
    ELSE response_value
  END as choice_type,
  COUNT(*)
FROM responses 
WHERE survey_question_id = 'xxx'
GROUP BY choice_type;

-- Extract "Other" text values
SELECT 
  response_value::json->>'value' as other_text
FROM responses 
WHERE survey_question_id = 'xxx'
  AND response_value::json->>'choice' = 'Other';
```

## Implementation Notes

- The UI automatically shows a text input field when "Other" is selected
- The text field updates the response value in real-time
- Empty "Other" selections (checkbox checked but no text entered) are saved as `{choice: "Other", value: ""}`
- The format is consistent and can be reliably parsed for data analysis

