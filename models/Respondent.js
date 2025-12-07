const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db');
const Survey = require('./Survey');

const Respondent = sequelize.define('Respondent', {
  respondentId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'respondent_id'
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
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('started', 'in-progress', 'completed'),
    defaultValue: 'started'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'start_time'
  },
  submitTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'submit_time'
  },
  totalTimeSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'total_time_seconds'
  }
}, {
  tableName: 'respondents',
  timestamps: true,
  underscored: true
});

// Define associations
Survey.hasMany(Respondent, { foreignKey: 'surveyId', as: 'respondents' });
Respondent.belongsTo(Survey, { foreignKey: 'surveyId' });

module.exports = Respondent;

