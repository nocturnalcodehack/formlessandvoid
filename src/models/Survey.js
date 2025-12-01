export default (sequelize, DataTypes) => {
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    thankYouMessage: {
      type: DataTypes.TEXT,
      defaultValue: 'Thank you for completing our survey!',
    },
    thankYouEmailSubject: {
      type: DataTypes.STRING,
      defaultValue: 'Thank you for your participation',
    },
    thankYouEmailBody: {
      type: DataTypes.TEXT,
      defaultValue: 'Thank you for taking the time to complete our survey. Your responses are valuable to us.',
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
    tableName: 'surveys',
  });

  return Survey;
};
