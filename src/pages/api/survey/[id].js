import { sequelize, Survey, SurveyQuestion } from 'src/models';
import logger from "src/utils/logger";

export default async function handler(req, res) {
  await sequelize.sync();
  const { id } = req.query;



  if (req.method === 'GET') {
    try {
      const survey = await Survey.findByPk(id, {
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          order: [['orderIndex', 'ASC']]
        }]
      });

      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      // Check if survey is active and within date range
      const now = new Date();
      if (!survey.isActive) {
        return res.status(403).json({ error: 'Survey is not active' });
      }

      if (survey.startDate && new Date(survey.startDate) > now) {
        return res.status(403).json({ error: 'Survey has not started yet' });
      }

      if (survey.endDate && new Date(survey.endDate) < now) {
        return res.status(403).json({ error: 'Survey has ended' });
      }

      logger.info(`survey[id]:GET: Survey Data: ${JSON.stringify(survey.toJSON())}`);
      res.status(200).json(survey);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
