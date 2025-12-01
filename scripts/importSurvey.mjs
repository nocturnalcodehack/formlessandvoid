#!/usr/bin/env node

/**
 * Survey Import Utility
 * This script imports surveys from JSON files into the database
 * Usage: node scripts/importSurvey.mjs <path-to-json-file>
 */

import { sequelize, Survey, SurveyQuestion } from '../src/models/index.js';
import logger from '../src/utils/logger.js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

// Function to validate survey data structure
function validateSurveyData(data) {
  const errors = [];

  // Required fields
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Survey title is required and must be a non-empty string');
  }

  // Optional but validated fields
  if (data.description && typeof data.description !== 'string') {
    errors.push('Survey description must be a string');
  }

  if (data.isActive && typeof data.isActive !== 'boolean') {
    errors.push('Survey isActive must be a boolean');
  }

  if (data.startDate && !isValidDate(data.startDate)) {
    errors.push('Survey startDate must be a valid date string');
  }

  if (data.endDate && !isValidDate(data.endDate)) {
    errors.push('Survey endDate must be a valid date string');
  }

  if (data.thankYouMessage && typeof data.thankYouMessage !== 'string') {
    errors.push('Survey thankYouMessage must be a string');
  }

  if (data.thankYouEmailSubject && typeof data.thankYouEmailSubject !== 'string') {
    errors.push('Survey thankYouEmailSubject must be a string');
  }

  if (data.thankYouEmailBody && typeof data.thankYouEmailBody !== 'string') {
    errors.push('Survey thankYouEmailBody must be a string');
  }

  if (data.createdBy && typeof data.createdBy !== 'string') {
    errors.push('Survey createdBy must be a string');
  }

  // Validate questions
  if (data.questions) {
    if (!Array.isArray(data.questions)) {
      errors.push('Survey questions must be an array');
    } else {
      data.questions.forEach((question, index) => {
        const questionErrors = validateQuestionData(question, index);
        errors.push(...questionErrors);
      });
    }
  }

  return errors;
}

// Function to validate question data
function validateQuestionData(question, index) {
  const errors = [];
  const validQuestionTypes = ['yes_no', 'likert_5', 'multiple_choice', 'multiple_choice_other', 'multiselect', 'text'];

  if (!question.questionText || typeof question.questionText !== 'string' || !question.questionText.trim()) {
    errors.push(`Question ${index + 1}: questionText is required and must be a non-empty string`);
  }

  if (!question.questionType || !validQuestionTypes.includes(question.questionType)) {
    errors.push(`Question ${index + 1}: questionType must be one of: ${validQuestionTypes.join(', ')}`);
  }

  if (question.options !== undefined && question.options !== null && !Array.isArray(question.options)) {
    errors.push(`Question ${index + 1}: options must be an array or null`);
  }

  if (question.isRequired !== undefined && typeof question.isRequired !== 'boolean') {
    errors.push(`Question ${index + 1}: isRequired must be a boolean`);
  }

  if (question.orderIndex !== undefined && (typeof question.orderIndex !== 'number' || question.orderIndex < 0)) {
    errors.push(`Question ${index + 1}: orderIndex must be a non-negative number`);
  }

  if (question.helpText !== undefined && question.helpText !== null && typeof question.helpText !== 'string') {
    errors.push(`Question ${index + 1}: helpText must be a string or null`);
  }

  return errors;
}

// Helper function to validate date strings
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask user for selection
function askSelection(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Function to check if survey already exists (for idempotency)
async function surveyExists(title, description) {
  const existingSurvey = await Survey.findOne({
    where: {
      title: title.trim(),
      description: (description || '').trim()
    }
  });
  return existingSurvey;
}

// Main import function
async function importSurvey(filePath) {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Syncing database schema...');
    await sequelize.sync();
    console.log('✅ Database schema synced');

    // Read and parse JSON file
    console.log(`📄 Reading survey data from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    let surveyData;

    try {
      surveyData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    console.log('✅ JSON file parsed successfully');

    // Validate survey data
    console.log('🔍 Validating survey data...');
    const validationErrors = validateSurveyData(surveyData);

    if (validationErrors.length > 0) {
      console.error('❌ Validation errors found:');
      validationErrors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Survey data validation failed');
    }

    console.log('✅ Survey data validation passed');

    // Check for existing survey (idempotency)
    console.log('🔍 Checking for existing survey...');
    const existingSurvey = await surveyExists(surveyData.title, surveyData.description);

    if (existingSurvey) {
      console.log(`⚠️  Survey already exists: "${existingSurvey.title}" (ID: ${existingSurvey.id})`);
      console.log('📊 Survey import skipped - no changes made');
      return existingSurvey;
    }

    // Start database transaction
    const transaction = await sequelize.transaction();

    try {
      console.log('🚀 Creating new survey...');

      // Create the survey
      const survey = await Survey.create({
        title: surveyData.title.trim(),
        description: (surveyData.description || '').trim(),
        isActive: surveyData.isActive || false,
        startDate: surveyData.startDate ? new Date(surveyData.startDate) : null,
        endDate: surveyData.endDate ? new Date(surveyData.endDate) : null,
        thankYouMessage: surveyData.thankYouMessage || 'Thank you for completing our survey!',
        thankYouEmailSubject: surveyData.thankYouEmailSubject || 'Thank you for your participation',
        thankYouEmailBody: surveyData.thankYouEmailBody || 'Thank you for taking the time to complete our survey. Your responses are valuable to us.',
        createdBy: surveyData.createdBy || 'import-script',
      }, { transaction });

      console.log(`✅ Survey created with ID: ${survey.id}`);

      // Create questions if provided
      if (surveyData.questions && Array.isArray(surveyData.questions) && surveyData.questions.length > 0) {
        console.log(`📝 Creating ${surveyData.questions.length} questions...`);

        const questionPromises = surveyData.questions.map((question, index) => {
          console.log(`  Creating question ${index + 1}: ${question.questionText.substring(0, 50)}...`);

          return SurveyQuestion.create({
            surveyId: survey.id,
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options || null,
            isRequired: question.isRequired !== undefined ? question.isRequired : true,
            orderIndex: question.orderIndex !== undefined ? question.orderIndex : index,
            helpText: question.helpText || null,
          }, { transaction });
        });

        await Promise.all(questionPromises);
        console.log(`✅ Created ${surveyData.questions.length} questions`);
      }

      // Commit transaction
      await transaction.commit();
      console.log('✅ Transaction committed successfully');

      // Fetch the complete survey with questions
      const completeSurvey = await Survey.findByPk(survey.id, {
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          order: [['orderIndex', 'ASC']]
        }]
      });

      console.log('\n🎉 Survey import completed successfully!');
      console.log(`📊 Survey Details:`);
      console.log(`   ID: ${completeSurvey.id}`);
      console.log(`   Title: ${completeSurvey.title}`);
      console.log(`   Description: ${completeSurvey.description || 'N/A'}`);
      console.log(`   Status: ${completeSurvey.isActive ? 'Active' : 'Draft'}`);
      console.log(`   Questions: ${completeSurvey.questions?.length || 0}`);
      console.log(`   Created: ${completeSurvey.createdAt}`);

      logger.info(`Survey imported successfully: ${completeSurvey.title} (ID: ${completeSurvey.id})`);

      return completeSurvey;

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Survey import failed:', error.message);
    logger.error('Survey import error:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: Please provide a path to the JSON file');
    console.log('Usage: node scripts/importSurvey.mjs <path-to-json-file>');
    console.log('Example: node scripts/importSurvey.mjs ./data/my-survey.json');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  console.log('\n Target Environment:', process.env.NODE_ENV);
  console.log('🚀 Starting survey import...');
  console.log(`📂 File: ${filePath}`);

  console.log('\n')
  const selection = await askSelection(`<Enter> or 'q' to quit: `);
  console.log('\n')

  if (selection.toLowerCase() === 'q') {
    console.log('❌ Export cancelled by user.');
    return null;
  }

  try {
    await importSurvey(filePath);
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Import failed with error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, closing database connection...');
  await sequelize.close();
  process.exit(0);
});

// Run the import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { importSurvey, validateSurveyData, validateQuestionData };
