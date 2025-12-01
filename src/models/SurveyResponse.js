export default (sequelize, DataTypes) => {
  const SurveyResponse = sequelize.define('SurveyResponse', {
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
    respondentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'survey_respondents',
        key: 'id',
      },
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'survey_questions',
        key: 'id',
      },
    },
    responseValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responseData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional response data for complex question types (JSON string)',
      get() {
        const rawValue = this.getDataValue('responseData');
        if (!rawValue) return null;
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          console.warn('Invalid JSON in responseData:', rawValue);
          return null;
        }
      },
      set(value) {
        if (value === null || value === undefined) {
          this.setDataValue('responseData', null);
        } else {
          this.setDataValue('responseData', JSON.stringify(value));
        }
      }
    },
  }, {
    timestamps: true,
    tableName: 'survey_responses',
  });

  return SurveyResponse;
};
