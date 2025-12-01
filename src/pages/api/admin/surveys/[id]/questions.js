import { sequelize, SurveyQuestion } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';

async function handler(req, res) {
  await sequelize.sync();
  const { id: surveyId } = req.query;

  if (req.method === 'GET') {
    try {
      const questions = await SurveyQuestion.findAll({
        where: { surveyId },
        order: [['orderIndex', 'ASC']]
      });

      res.status(200).json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('Creating question with data:', req.body);
      const questionData = {
        ...req.body,
        surveyId: surveyId
      };

      const question = await SurveyQuestion.create(questionData);
      console.log('Question created successfully:', question.id);
      res.status(201).json(question);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default adminAPIAuth(handler);
