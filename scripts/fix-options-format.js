const { initDb, SurveyQuestion } = require('../models');

async function fixOptionsFormat() {
  try {
    console.log('Initializing database...');
    await initDb();

    console.log('Fetching questions with array options...');
    const questions = await SurveyQuestion.findAll();

    let fixed = 0;
    for (const question of questions) {
      // Check if options is an array (wrong format)
      if (Array.isArray(question.options)) {
        console.log(`\nFixing question ${question.surveyQuestionId}:`);
        console.log(`  Type: ${question.itemType}`);
        console.log(`  Current options:`, question.options);

        let newOptions;
        if (question.itemType === 'likert') {
          newOptions = { scale: question.options };
        } else if (['multiple-choice', 'multiple-other', 'multiselect', 'multiselect-other'].includes(question.itemType)) {
          newOptions = { choices: question.options };
        } else {
          console.log(`  Skipping - unexpected type for array options`);
          continue;
        }

        await question.update({ options: newOptions });
        console.log(`  New options:`, newOptions);
        fixed++;
      }
    }

    console.log(`\n\nFixed ${fixed} question(s)`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixOptionsFormat();

