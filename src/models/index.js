// Import the centralized Sequelize configuration
import sequelize from '../../config/database.js';
import { DataTypes } from 'sequelize';

// Import models
import SurveyModel from './Survey.js';
import SurveyQuestionModel from './SurveyQuestion.js';
import SurveyRespondentModel from './SurveyRespondent.js';
import SurveyResponseModel from './SurveyResponse.js';

const Survey = SurveyModel(sequelize, DataTypes);
const SurveyQuestion = SurveyQuestionModel(sequelize, DataTypes);
const SurveyRespondent = SurveyRespondentModel(sequelize, DataTypes);
const SurveyResponse = SurveyResponseModel(sequelize, DataTypes);

// Define associations
Survey.hasMany(SurveyQuestion, { foreignKey: 'surveyId', as: 'questions' });
SurveyQuestion.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

Survey.hasMany(SurveyRespondent, { foreignKey: 'surveyId', as: 'respondents' });
SurveyRespondent.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

Survey.hasMany(SurveyResponse, { foreignKey: 'surveyId', as: 'responses' });
SurveyResponse.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

SurveyRespondent.hasMany(SurveyResponse, { foreignKey: 'respondentId', as: 'responses' });
SurveyResponse.belongsTo(SurveyRespondent, { foreignKey: 'respondentId', as: 'respondent' });

SurveyQuestion.hasMany(SurveyResponse, { foreignKey: 'questionId', as: 'responses' });
SurveyResponse.belongsTo(SurveyQuestion, { foreignKey: 'questionId', as: 'question' });

// Export models and sequelize instance
export {
  sequelize,
  Survey,
  SurveyQuestion,
  SurveyRespondent,
  SurveyResponse,
};
