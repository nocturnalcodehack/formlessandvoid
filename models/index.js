const sequelize = require('../lib/db');
const Survey = require('./Survey');
const SurveyQuestion = require('./SurveyQuestion');
const Respondent = require('./Respondent');
const Response = require('./Response');

// Initialize all models and sync with database
const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Survey,
  SurveyQuestion,
  Respondent,
  Response,
  initDb
};

