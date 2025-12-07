const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db');

const Survey = sequelize.define('Survey', {
  surveyId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'survey_id'
  },
  shortName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'short_name'
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  hasResponses: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_responses'
  }
}, {
  tableName: 'surveys',
  timestamps: true,
  underscored: true
});

module.exports = Survey;

