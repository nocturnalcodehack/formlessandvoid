import { sequelize, Survey, SurveyQuestion } from 'src/models';
import logger from "src/utils/logger";
import getClientIP  from "src/utils/getClientIP";

export default async function handler(req, res) {
  await sequelize.sync();

  const ip = getClientIP(req);
  logger.debug(`survey [id] API:INIT: IP: ${ip}, Method: ${req.method}, headers: ${JSON.stringify(req.headers)}, body: ${JSON.stringify(req.body)}`);

  if (req.method === 'GET') {
    try {
      const now = new Date();

      const surveys = await Survey.findAll({
        where: {
          isActive: true
        },
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          attributes: ['id', 'questionText', 'questionType', 'orderIndex']
        }],
        order: [['createdAt', 'DESC']]
      });

      // Filter surveys based on date constraints
      const activeSurveys = surveys.filter(survey => {
        // Check if survey has started (if startDate is set)
        if (survey.startDate && new Date(survey.startDate) > now) {
          return false;
        }

        // Check if survey hasn't ended (if endDate is set)
        if (survey.endDate && new Date(survey.endDate) < now) {
          return false;
        }

        return true;
      });

      res.status(200).json(activeSurveys);
    } catch (error) {
      logger.info(`survey [id] API:GET: error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
