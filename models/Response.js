const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db');
const Respondent = require('./Respondent');
const SurveyQuestion = require('./SurveyQuestion');

const Response = sequelize.define('Response', {
  responseId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'response_id'
  },
  respondentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'respondent_id',
    references: {
      model: 'respondents',
      key: 'respondent_id'
    }
  },
  surveyQuestionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'survey_question_id',
    references: {
      model: 'survey_questions',
      key: 'survey_question_id'
    }
  },
  responseValue: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'response_value'
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'time_spent_seconds'
  },
  visitCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    field: 'visit_count'
  }
}, {
  tableName: 'responses',
  timestamps: true,
  underscored: true
});

// Define associations
Respondent.hasMany(Response, { foreignKey: 'respondentId', as: 'responses' });
Response.belongsTo(Respondent, { foreignKey: 'respondentId' });

SurveyQuestion.hasMany(Response, { foreignKey: 'surveyQuestionId', as: 'responses' });
Response.belongsTo(SurveyQuestion, { foreignKey: 'surveyQuestionId' });

module.exports = Response;

