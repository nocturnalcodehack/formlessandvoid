const { Survey } = require('../models');
const { Op } = require('sequelize');

(async () => {
  try {
    console.log('=== ALL SURVEYS ===');
    const allSurveys = await Survey.findAll({
      attributes: ['surveyId', 'shortName', 'isActive', 'isPublic', 'startDate', 'endDate']
    });
    console.log(JSON.stringify(allSurveys, null, 2));

    console.log('\n=== FILTERING LOGIC ===');
    const now = new Date();
    console.log('Current time:', now);

    const surveys = await Survey.findAll({
      where: {
        isActive: true,
        isPublic: true,
        [Op.or]: [
          { startDate: null },
          { startDate: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: now } }
        ]
      },
      attributes: ['surveyId', 'shortName', 'fullName', 'description', 'isActive', 'isPublic', 'startDate', 'endDate']
    });

    console.log('\n=== FILTERED SURVEYS (should show in navbar) ===');
    console.log(JSON.stringify(surveys, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

