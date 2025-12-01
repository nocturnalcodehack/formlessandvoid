export default (sequelize, DataTypes) => {
  const SurveyQuestion = sequelize.define('SurveyQuestion', {
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
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    questionType: {
      type: DataTypes.ENUM('yes_no', 'likert_5', 'multiple_choice', 'multiple_choice_other', 'multiselect', 'text'),
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON array of options for multiple choice questions',
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    helpText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
      tableName: `survey_questions`,
  });

  return SurveyQuestion;
};
