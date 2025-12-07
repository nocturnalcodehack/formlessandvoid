const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db');
const Survey = require('./Survey');

const SurveyQuestion = sequelize.define('SurveyQuestion', {
  surveyQuestionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'survey_question_id'
  },
  surveyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'survey_id',
    references: {
      model: 'surveys',
      key: 'survey_id'
    }
  },
  sequenceNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sequence_number'
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text'
  },
  itemType: {
    type: DataTypes.ENUM('text', 'yes-no', 'likert', 'multiple-choice', 'multiple-other'),
    allowNull: false,
    field: 'item_type'
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_required'
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'For multiple-choice, multiple-other, and likert scales'
  }
}, {
  tableName: 'survey_questions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['survey_id', 'sequence_number']
    }
  ]
});

// Define associations
Survey.hasMany(SurveyQuestion, { foreignKey: 'surveyId', as: 'questions' });
SurveyQuestion.belongsTo(Survey, { foreignKey: 'surveyId' });

module.exports = SurveyQuestion;

