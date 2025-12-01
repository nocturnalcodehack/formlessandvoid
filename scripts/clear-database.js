#!/usr/bin/env node

/**
 * Database Cleanup Utility
 * This script safely empties all survey-related tables while preserving table structure
 */

import { sequelize, Survey, SurveyQuestion, SurveyRespondent, SurveyResponse } from 'src/models';
import logger from 'src/utils/logger.js';
import readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask user confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function clearDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Syncing database schema...');
    await sequelize.sync();
    console.log('✅ Database schema synced');

    // Get counts before deletion
    const surveyCount = await Survey.count();
    const questionCount = await SurveyQuestion.count();
    const respondentCount = await SurveyRespondent.count();
    const responseCount = await SurveyResponse.count();

    console.log('\n📊 Current database state:');
    console.log(`  Surveys: ${surveyCount}`);
    console.log(`  Questions: ${questionCount}`);
    console.log(`  Respondents: ${respondentCount}`);
    console.log(`  Responses: ${responseCount}`);

    if (surveyCount === 0 && questionCount === 0 && respondentCount === 0 && responseCount === 0) {
      console.log('\n✅ Database is already empty!');
      rl.close();
      await sequelize.close();
      process.exit(0);
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This action will permanently delete ALL survey data!');
    console.log('   This includes all surveys, questions, respondents, and responses.');
    console.log('   This action CANNOT be undone.\n');

    const confirmation = await askConfirmation('Are you sure you want to continue? (yes/no): ');

    if (confirmation !== 'yes' && confirmation !== 'y') {
      console.log('\n❌ Operation cancelled by user.');
      rl.close();
      await sequelize.close();
      process.exit(0);
    }

    console.log('\n🗑️  Starting database cleanup...');

    // Delete in correct order due to foreign key constraints
    console.log('  Deleting survey responses...');
    const deletedResponses = await SurveyResponse.destroy({ where: {}, force: true });
    console.log(`    ✅ Deleted ${deletedResponses} responses`);

    console.log('  Deleting survey respondents...');
    const deletedRespondents = await SurveyRespondent.destroy({ where: {}, force: true });
    console.log(`    ✅ Deleted ${deletedRespondents} respondents`);

    console.log('  Deleting survey questions...');
    const deletedQuestions = await SurveyQuestion.destroy({ where: {}, force: true });
    console.log(`    ✅ Deleted ${deletedQuestions} questions`);

    console.log('  Deleting surveys...');
    const deletedSurveys = await Survey.destroy({ where: {}, force: true });
    console.log(`    ✅ Deleted ${deletedSurveys} surveys`);

    // Reset auto-increment counters (SQLite specific)
    console.log('\n🔄 Resetting auto-increment counters...');
    await sequelize.query("DELETE FROM sqlite_sequence WHERE name IN ('surveys', 'survey_questions', 'survey_respondents', 'survey_responses')");
    console.log('✅ Auto-increment counters reset');

    // Verify cleanup
    const finalSurveyCount = await Survey.count();
    const finalQuestionCount = await SurveyQuestion.count();
    const finalRespondentCount = await SurveyRespondent.count();
    const finalResponseCount = await SurveyResponse.count();

    console.log('\n📊 Final database state:');
    console.log(`  Surveys: ${finalSurveyCount}`);
    console.log(`  Questions: ${finalQuestionCount}`);
    console.log(`  Respondents: ${finalRespondentCount}`);
    console.log(`  Responses: ${finalResponseCount}`);

    if (finalSurveyCount === 0 && finalQuestionCount === 0 && finalRespondentCount === 0 && finalResponseCount === 0) {
      console.log('\n🎉 Database successfully cleared!');
      logger.info('Database tables cleared successfully');
    } else {
      console.log('\n⚠️  Warning: Some records may still exist');
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    logger.error('Database clear error:', error);
    rl.close();
    await sequelize.close();
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, closing database connection...');
  rl.close();
  await sequelize.close();
  process.exit(0);
});

// Run the cleanup
console.log('🚀 Starting database cleanup utility...');
console.log('⚠️  This will permanently delete ALL survey data!');

clearDatabase();
