export default (sequelize, DataTypes) => {
  const SurveyRespondent = sequelize.define('SurveyRespondent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    surveyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id',
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thankYouEmailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    tableName: 'survey_respondents',
  });

  return SurveyRespondent;
};
