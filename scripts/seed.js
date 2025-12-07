const { initDb, Survey, SurveyQuestion } = require('../models');

async function seedDatabase() {
  try {
    console.log('Initializing database...');
    await initDb();

    console.log('Creating sample survey...');

    // Create a sample survey
    const survey = await Survey.create({
      shortName: 'Customer Satisfaction',
      fullName: 'Customer Satisfaction Survey 2024',
      description: 'Help us understand your experience with our services',
      isActive: true,
      isPublic: true,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31')
    });

    console.log('Survey created:', survey.surveyId);

    // Create sample questions
    const questions = [
      {
        surveyId: survey.surveyId,
        sequenceNumber: 1,
        questionText: 'How satisfied are you with our service?',
        itemType: 'likert',
        isRequired: true,
        options: {
          scale: [
            'Very Dissatisfied',
            'Dissatisfied',
            'Neutral',
            'Satisfied',
            'Very Satisfied'
          ]
        }
      },
      {
        surveyId: survey.surveyId,
        sequenceNumber: 2,
        questionText: 'Would you recommend us to a friend?',
        itemType: 'yes-no',
        isRequired: true,
        options: null
      },
      {
        surveyId: survey.surveyId,
        sequenceNumber: 3,
        questionText: 'What type of customer are you?',
        itemType: 'multiple-choice',
        isRequired: true,
        options: {
          choices: [
            'First-time customer',
            'Returning customer',
            'Long-term customer',
            'Business customer'
          ]
        }
      },
      {
        surveyId: survey.surveyId,
        sequenceNumber: 4,
        questionText: 'How did you hear about us?',
        itemType: 'multiple-other',
        isRequired: false,
        options: {
          choices: [
            'Social Media',
            'Search Engine',
            'Friend or Family',
            'Advertisement'
          ]
        }
      },
      {
        surveyId: survey.surveyId,
        sequenceNumber: 5,
        questionText: 'Please share any additional feedback or suggestions',
        itemType: 'text',
        isRequired: false,
        options: null
      }
    ];

    for (const question of questions) {
      await SurveyQuestion.create(question);
    }

    console.log('Sample questions created');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

