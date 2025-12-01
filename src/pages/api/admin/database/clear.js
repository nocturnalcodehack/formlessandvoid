import { sequelize, Survey, SurveyQuestion, SurveyRespondent, SurveyResponse } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';
import getClientIP from 'src/utils/getClientIP';
import logger from "src/utils/logger";

async function handler(req, res) {
  await sequelize.sync();

  const ip = getClientIP(req);
  logger.debug(`database clear API:INIT: IP: ${ip}, Method: ${req.method}`);

  if (req.method === 'DELETE') {
    try {
      // Get counts before deletion for logging
      const surveyCount = await Survey.count();
      const questionCount = await SurveyQuestion.count();
      const respondentCount = await SurveyRespondent.count();
      const responseCount = await SurveyResponse.count();

      logger.info(`database clear API: Starting cleanup - Surveys: ${surveyCount}, Questions: ${questionCount}, Respondents: ${respondentCount}, Responses: ${responseCount}`);

      // Delete in correct order due to foreign key constraints
      const deletedResponses = await SurveyResponse.destroy({ where: {}, force: true });
      const deletedRespondents = await SurveyRespondent.destroy({ where: {}, force: true });
      const deletedQuestions = await SurveyQuestion.destroy({ where: {}, force: true });
      const deletedSurveys = await Survey.destroy({ where: {}, force: true });

      // Reset auto-increment counters (SQLite specific)
      await sequelize.query("DELETE FROM sqlite_sequence WHERE name IN ('surveys', 'survey_questions', 'survey_respondents', 'survey_responses')");

      logger.info(`database clear API: Cleanup completed - Deleted: ${deletedSurveys} surveys, ${deletedQuestions} questions, ${deletedRespondents} respondents, ${deletedResponses} responses`);

      return res.status(200).json({
        message: 'Database cleared successfully',
        deletedCounts: {
          surveys: deletedSurveys,
          questions: deletedQuestions,
          respondents: deletedRespondents,
          responses: deletedResponses
        }
      });

    } catch (error) {
      logger.error(`database clear API: Error clearing database: ${error.message}`);
      return res.status(500).json({ error: 'Failed to clear database', details: error.message });
    }

  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default adminAPIAuth(handler);
