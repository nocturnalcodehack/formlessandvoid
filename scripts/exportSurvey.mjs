#!/usr/bin/env node

/**
 * RUN FROM PROJECT ROOT: node scripts/exportSurvey.mjs <output-file-path>
 * Survey Export Utility
 * This script exports surveys from the database to JSON files
 * Usage: node scripts/exportSurvey.mjs <output-file-path>
 */

import dotenv from 'dotenv';
import path from 'path';
// Load environment variables FIRST, before any other imports
dotenv.config();

import { sequelize, Survey, SurveyQuestion } from '../src/models/index.js';
import logger from '../src/utils/logger.js';
import readline from 'readline';
import fs from 'fs';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


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

// Function to display survey list and get user selection
async function selectSurvey(surveys) {
  console.log(`\n\n ${process.env.NODE_ENV} Available Surveys:`);
  console.log('══════════════════════════════════════════════════════════════════');

  surveys.forEach((survey, index) => {
    const status = survey.isActive ? '🟢 Active' : '🔴 Draft';
    const questionCount = survey.questions ? survey.questions.length : 0;
    const createdDate = new Date(survey.createdAt).toLocaleDateString();

    console.log(`${index + 1}. ${survey.title}`);
    console.log(`   Status: ${status} | Questions: ${questionCount} | Created: ${createdDate}`);
    if (survey.description) {
      console.log(`   Description: ${survey.description.substring(0, 80)}${survey.description.length > 80 ? '...' : ''}`);
    }
    console.log('   ──────────────────────────────────────────────────────────────');
  });

  console.log('\nSelect a survey to export:');
  const selection = await askSelection(`Enter the number (1-${surveys.length}) or 'q' to quit: `);

  if (selection.toLowerCase() === 'q') {
    console.log('❌ Export cancelled by user.');
    return null;
  }

  const selectedIndex = parseInt(selection) - 1;

  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= surveys.length) {
    console.log('❌ Invalid selection. Please enter a valid number.');
    return await selectSurvey(surveys); // Recursive call for retry
  }

  return surveys[selectedIndex];
}

// Function to convert survey data to export format
function formatSurveyForExport(survey) {
  const exportData = {
    title: survey.title,
    description: survey.description || '',
    isActive: survey.isActive,
    startDate: survey.startDate ? survey.startDate.toISOString() : null,
    endDate: survey.endDate ? survey.endDate.toISOString() : null,
    thankYouMessage: survey.thankYouMessage || 'Thank you for completing our survey!',
    thankYouEmailSubject: survey.thankYouEmailSubject || 'Thank you for your participation',
    thankYouEmailBody: survey.thankYouEmailBody || 'Thank you for taking the time to complete our survey. Your responses are valuable to us.',
    createdBy: survey.createdBy || 'export-script'
  };

  // Add questions if they exist
  if (survey.questions && survey.questions.length > 0) {
    exportData.questions = survey.questions.map(question => ({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || null,
      isRequired: question.isRequired,
      orderIndex: question.orderIndex,
      helpText: question.helpText || null
    }));
  }

  return exportData;
}

// Function to write JSON file
async function writeJsonFile(filePath, data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }

    // Write the file
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');

    console.log(`✅ Survey exported successfully to: ${filePath}`);
    console.log(`📊 File size: ${(jsonString.length / 1024).toFixed(2)} KB`);

    return true;
  } catch (error) {
    console.error(`❌ Error writing file: ${error.message}`);
    return false;
  }
}

// Function to check if file exists and ask for overwrite confirmation
async function checkFileOverwrite(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  File already exists: ${filePath}`);
    const confirm = await askSelection('Do you want to overwrite it? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Export cancelled to prevent overwriting existing file.');
      return false;
    }
  }
  return true;
}

// Main export function
async function exportSurvey(outputPath) {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Syncing database schema...');
    await sequelize.sync();
    console.log('✅ Database schema synced');

    // Fetch all surveys with their questions
    console.log('📊 Fetching surveys from database...');
    const surveys = await Survey.findAll({
      include: [{
        model: SurveyQuestion,
        as: 'questions',
        order: [['orderIndex', 'ASC']]
      }],
      order: [['createdAt', 'DESC']]
    });

    if (surveys.length === 0) {
      console.log('📭 No surveys found in the database.');
      console.log('💡 Create some surveys first using the admin interface or import script.');
      return;
    }

    console.log(`✅ Found ${surveys.length} survey(s) in the database`);

    // Let user select a survey
    const selectedSurvey = await selectSurvey(surveys);

    if (!selectedSurvey) {
      return; // User cancelled
    }

    console.log(`\n🎯 Selected Survey: "${selectedSurvey.title}"`);
    console.log(`📝 Questions: ${selectedSurvey.questions?.length || 0}`);
    console.log(`📅 Created: ${new Date(selectedSurvey.createdAt).toLocaleString()}`);

    // Check for file overwrite
    const canProceed = await checkFileOverwrite(outputPath);
    if (!canProceed) {
      return;
    }

    // Format survey data for export
    console.log('\n🔄 Formatting survey data...');
    const exportData = formatSurveyForExport(selectedSurvey);
    console.log('✅ Survey data formatted');

    // Write to file
    console.log('💾 Writing export file...');
    const success = await writeJsonFile(outputPath, exportData);

    if (success) {
      console.log('\n🎉 Survey export completed successfully!');
      console.log(`📂 Exported Survey Details:`);
      console.log(`   Title: ${exportData.title}`);
      console.log(`   Description: ${exportData.description || 'N/A'}`);
      console.log(`   Status: ${exportData.isActive ? 'Active' : 'Draft'}`);
      console.log(`   Questions: ${exportData.questions?.length || 0}`);
      console.log(`   Start Date: ${exportData.startDate || 'N/A'}`);
      console.log(`   End Date: ${exportData.endDate || 'N/A'}`);
      console.log(`   File: ${outputPath}`);

      logger.info(`Survey exported successfully: ${exportData.title} -> ${outputPath}`);
    }

  } catch (error) {
    console.error('❌ Survey export failed:', error.message);
    logger.error(`Survey export error: ${error}`)
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

// Command line interface
async function main() {

  const args = process.argv.slice(2);

  console.log('DB:', process.env.DATABASE_HOST);

  if (args.length === 0) {
    console.error('❌ Error: Please provide an output file path');
    console.log('Usage: node scripts/exportSurvey.mjs <output-file-path>');
    console.log('Example: node scripts/exportSurvey.mjs ./exports/my-survey.json');
    console.log('Example: node scripts/exportSurvey.mjs /path/to/exported-survey.json');
    process.exit(1);
  }

  const outputPath = path.resolve(args[0]);

  // Validate file extension
  if (!outputPath.endsWith('.json')) {
    console.error('❌ Error: Output file must have a .json extension');
    process.exit(1);
  }

  console.log('🚀 Starting survey export utility...');
  console.log(`📁 Output file: ${outputPath}`);

  try {
    await exportSurvey(outputPath);
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Export failed with error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, closing database connection...');
  rl.close();
  await sequelize.close();
  process.exit(0);
});

// Clean up readline on exit
process.on('exit', () => {
  rl.close();
});

// Run the export if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { exportSurvey, formatSurveyForExport };
