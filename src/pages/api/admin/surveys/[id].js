import { sequelize, Survey, SurveyQuestion } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';
import logger from "src/utils/logger";
import getClientIP from "src/utils/getClientIP";

async function handler(req, res) {
  await sequelize.sync();

  const { id } = req.query;
  const ip = getClientIP(req);
  logger.debug(`surveys API:INIT: IP: ${ip}, Method: ${req.method}, headers: ${JSON.stringify(req.headers)}, body: ${JSON.stringify(req.body)}`);

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
        logger.debug(`surveys API:GET: IP: Survey ID: ${id} not found`);
        return res.status(404).json({ error: 'Survey not found' });
      }

      res.status(200).json(survey);
    } catch (error) {
      logger.debug(`surveys API:GET: error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const [updatedRows] = await Survey.update(req.body, {
        where: { id },
        returning: true
      });

      if (updatedRows === 0) {
        logger.debug(`surveys API:POST: Survey ${id} not created`);
        return res.status(404).json({ error: 'Survey not found' });
      }

      const updatedSurvey = await Survey.findByPk(id, {
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          order: [['orderIndex', 'ASC']]
        }]
      });

      res.status(200).json(updatedSurvey);
    } catch (error) {
      logger.debug(`surveys API:POST: error: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description, startDate, endDate, isActive, questions } = req.body;

      // Validate required fields
      if (!title || !title.trim()) {
        logger.debug(`surveys API:PUT: Missing required field: title for survey ID: ${id}`);
        return res.status(400).json({ error: 'Survey title is required' });
      }

      // Find the existing survey
      const existingSurvey = await Survey.findByPk(id);
      if (!existingSurvey) {
        logger.debug(`surveys API:PUT: Survey ID: ${id} not found`);
        return res.status(404).json({ error: 'Survey not found' });
      }

      // Update the survey
      await existingSurvey.update({
        title: title.trim(),
        description: description?.trim() || '',
        startDate: startDate || null,
        endDate: endDate || null,
        isActive: isActive || false,
      });

      logger.debug(`surveys API:PUT: Survey ID: ${id} updated successfully`);

      // Update questions if provided
      if (questions && Array.isArray(questions)) {
        // Delete existing questions for this survey
        await SurveyQuestion.destroy({
          where: { surveyId: id }
        });

        // Create new questions
        if (questions.length > 0) {
          // Add debugging for individual survey PUT method
          console.log('surveys/[id] API: PUT: Questions data received:', JSON.stringify(questions, null, 2));

          const questionPromises = questions.map((question, index) => {
            console.log(`surveys/[id] API: PUT: Creating question ${index + 1}:`, {
              questionText: question.questionText,
              questionType: question.questionType,
              options: question.options,
              optionsType: typeof question.options,
              optionsLength: question.options?.length,
              optionsStringified: JSON.stringify(question.options)
            });

            // Additional validation for options
            if (question.options && !Array.isArray(question.options)) {
              console.error(`surveys/[id] API: PUT: WARNING - Options for question ${index + 1} is not an array:`, question.options);
            }

            return SurveyQuestion.create({
              surveyId: id,
              questionText: question.questionText,
              questionType: question.questionType,
              options: question.options || null,
              isRequired: question.required || false,
              orderIndex: question.orderIndex !== undefined ? question.orderIndex : index,
              helpText: question.helpText || null,
            });
          });

          await Promise.all(questionPromises);
          logger.debug(`surveys API:PUT: Updated ${questions.length} questions for survey ID: ${id}`);
        }
      }

      // Return the updated survey with questions
      const updatedSurvey = await Survey.findByPk(id, {
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          order: [['orderIndex', 'ASC']]
        }]
      });

      res.status(200).json(updatedSurvey);
    } catch (error) {
      logger.debug(`surveys API:PUT: error: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedRows = await Survey.destroy({
        where: { id }
      });

      if (deletedRows === 0) {
        logger.debug(`surveys API:DELETE: Survey ID: ${id} not deleted`);
        return res.status(404).json({ error: 'Survey not found' });
      }

      res.status(200).json({ message: 'Survey deleted successfully' });
    } catch (error) {
      logger.debug(`surveys API:DELETE: error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default adminAPIAuth(handler);
