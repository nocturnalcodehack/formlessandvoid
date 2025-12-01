import { sequelize, Survey, SurveyResponse, SurveyRespondent, SurveyQuestion } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';
import getClientIP from 'src/utils/getClientIP';
import logger from "src/utils/logger";

async function handler(req, res) {
  await sequelize.sync();

  const { id } = req.query;
  const ip = getClientIP(req);

  logger.debug(`responses API:INIT: IP: ${ip}, Method: ${req.method}, headers: ${JSON.stringify(req.headers)}, body: ${JSON.stringify(req.body)}`);

  if (req.method === 'GET') {
    try {
      const survey = await Survey.findByPk(id);

      if (!survey) {
        logger.error(`responses API: survey GET: Survey with id ${id} not found`);
        return res.status(404).json({ error: 'Survey not found' });
      }

      logger.debug(`responses API: survey GET: Found survey with id ${id}, fetching responses`);

      // Get all responses for this survey with respondent and question data
      const responses = await SurveyResponse.findAll({
        where: { surveyId: id },
        include: [
          {
            model: SurveyRespondent,
            as: 'respondent'
          },
          {
            model: SurveyQuestion,
            as: 'question'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      logger.debug(`responses API: response GET: Found ${responses.length} responses for survey id ${id}`);

      // Group responses by question first, then collect all responses for that question
      const questionResponses = {};
      const respondentData = {};

      responses.forEach(response => {
        const questionId = response.questionId;
        const respondentId = response.respondentId;

        // Store respondent data
        if (!respondentData[respondentId]) {
          respondentData[respondentId] = {
            id: respondentId,
            respondent: response.respondent,
            createdAt: response.createdAt
          };
        }

        // Group responses by question
        if (!questionResponses[questionId]) {
          questionResponses[questionId] = {
            questionId: questionId,
            question: response.question,
            responses: []
          };
        }

        questionResponses[questionId].responses.push({
          respondentId: respondentId,
          responseValue: response.responseValue,
          responseData: response.responseData,
          createdAt: response.createdAt,
          respondent: response.respondent
        });
      });

      // Also provide the legacy format for backward compatibility
      const groupedByRespondent = {};
      responses.forEach(response => {
        const respondentId = response.respondentId;

        if (!groupedByRespondent[respondentId]) {
          groupedByRespondent[respondentId] = {
            id: respondentId,
            respondent: response.respondent,
            createdAt: response.createdAt,
            responses: {}
          };
        }

        groupedByRespondent[respondentId].responses[response.questionId] = response.responseValue;

        // Keep the earliest createdAt for the respondent
        if (new Date(response.createdAt) < new Date(groupedByRespondent[respondentId].createdAt)) {
          groupedByRespondent[respondentId].createdAt = response.createdAt;
        }
      });

      const result = {
        byQuestion: Object.values(questionResponses),
        byRespondent: Object.values(groupedByRespondent),
        totalRespondents: Object.keys(respondentData).length,
        totalResponses: responses.length
      };

      logger.debug(`responses API: returning ${result.byQuestion.length} questions with responses`);
      return res.status(200).json(result);
    } catch (error) {
      logger.error(`responses API: response GET: Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default adminAPIAuth(handler);
