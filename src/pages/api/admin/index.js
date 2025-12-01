import { sequelize, Survey, SurveyQuestion } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';
import logger from "src/utils/logger";
import getClientIP from 'src/utils/getClientIP';

async function handler(req, res) {
  try {
    await sequelize.sync();

    const ip = getClientIP(req);
    logger.debug(`list survey API:INIT: IP: ${ip}, Method: ${req.method}, headers: ${JSON.stringify(req.headers)}, body: ${JSON.stringify(req.body)}`);

    if (req.method === 'GET') {
      const surveys = await Survey.findAll({
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          attributes: ['id', 'questionText', 'questionType', 'orderIndex']
        }],
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json(surveys);
    } else if (req.method === 'POST') {
      const survey = await Survey.create(req.body);
      res.status(201).json(survey);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Not Allowed`);
    }
  } catch (error) {
    logger.error(`surveys API error: ${error.message}`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default adminAPIAuth(handler);
