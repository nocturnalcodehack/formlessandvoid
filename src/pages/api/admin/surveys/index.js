import { sequelize, Survey, SurveyQuestion } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';
import getClientIP from 'src/utils/getClientIP';
import logger from "src/utils/logger";

async function handler(req, res) {
  await sequelize.sync();

  const ip = getClientIP(req);
  logger.debug(`surveys API:INIT: IP: ${ip}, Method: ${req.method}`);

  if (req.method === 'POST') {
    // Create new survey
    try {
      const { title, description, startDate, endDate, isActive, questions } = req.body;

      // Validate required fields
      if (!title || !title.trim()) {
        logger.error(`surveys API: POST: Missing required field: title`);
        return res.status(400).json({ error: 'Survey title is required' });
      }

      // Create the survey
      const survey = await Survey.create({
        title: title.trim(),
        description: description?.trim() || '',
        startDate: startDate || null,
        endDate: endDate || null,
        isActive: isActive || false,
        createdBy: 'admin', // You can enhance this with actual user authentication
      });

      logger.info(`surveys API: POST: Survey created with ID: ${survey.id}`);

      // Create questions if provided
      if (questions && Array.isArray(questions) && questions.length > 0) {
        // Add debugging to see what question data we're receiving
        console.log('surveys API: POST: Questions data received:', JSON.stringify(questions, null, 2));

        const questionPromises = questions.map((question, index) => {
          console.log(`surveys API: POST: Creating question ${index + 1}:`, {
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options,
            optionsType: typeof question.options,
            optionsLength: question.options?.length,
            optionsStringified: JSON.stringify(question.options)
          });

          // Additional validation for options
          if (question.options && !Array.isArray(question.options)) {
            console.error(`surveys API: POST: WARNING - Options for question ${index + 1} is not an array:`, question.options);
          }

          return SurveyQuestion.create({
            surveyId: survey.id,
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options || null,
            isRequired: question.required || false,
            orderIndex: question.orderIndex !== undefined ? question.orderIndex : index,
            helpText: question.helpText || null,
          });
        });

        await Promise.all(questionPromises);
        logger.info(`surveys API: POST: Created ${questions.length} questions for survey ${survey.id}`);
      }

      // Return the created survey with questions
      const createdSurvey = await Survey.findByPk(survey.id, {
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          order: [['orderIndex', 'ASC']]
        }]
      });

      return res.status(201).json(createdSurvey);

    } catch (error) {
      logger.error(`surveys API: POST: Error creating survey: ${error.message}`);
      return res.status(500).json({ error: 'Failed to create survey', details: error.message });
    }

  } else if (req.method === 'GET') {
    // Get all surveys
    try {
      const surveys = await Survey.findAll({
        include: [{
          model: SurveyQuestion,
          as: 'questions',
          order: [['orderIndex', 'ASC']]
        }],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json(surveys);

    } catch (error) {
      logger.error(`surveys API: GET: Error fetching surveys: ${error.message}`);
      return res.status(500).json({ error: 'Failed to fetch surveys' });
    }

  } else if (req.method === 'PUT') {
    // Update existing survey
    try {
      const { id, title, description, startDate, endDate, isActive, questions } = req.body;

      // Validate required fields
      if (!id) {
        logger.error(`surveys API: PUT: Missing required field: id`);
        return res.status(400).json({ error: 'Survey ID is required for updates' });
      }

      if (!title || !title.trim()) {
        logger.error(`surveys API: PUT: Missing required field: title`);
        return res.status(400).json({ error: 'Survey title is required' });
      }

      // Find the existing survey
      const existingSurvey = await Survey.findByPk(id);
      if (!existingSurvey) {
        logger.error(`surveys API: PUT: Survey not found with ID: ${id}`);
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

      logger.info(`surveys API: PUT: Survey updated with ID: ${id}`);

      // Update questions if provided
      if (questions && Array.isArray(questions)) {
        // Delete existing questions for this survey
        await SurveyQuestion.destroy({
          where: { surveyId: id }
        });

        // Create new questions
        if (questions.length > 0) {
          // Add debugging for PUT method
          console.log('surveys API: PUT: Questions data received:', JSON.stringify(questions, null, 2));

          const questionPromises = questions.map((question, index) => {
            console.log(`surveys API: PUT: Creating question ${index + 1}:`, {
              questionText: question.questionText,
              questionType: question.questionType,
              options: question.options,
              optionsType: typeof question.options,
              optionsLength: question.options?.length,
              optionsStringified: JSON.stringify(question.options)
            });

            // Additional validation for options
            if (question.options && !Array.isArray(question.options)) {
              console.error(`surveys API: PUT: WARNING - Options for question ${index + 1} is not an array:`, question.options);
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
          logger.info(`surveys API: PUT: Updated ${questions.length} questions for survey ${id}`);
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

      return res.status(200).json(updatedSurvey);

    } catch (error) {
      logger.error(`surveys API: PUT: Error updating survey: ${error.message}`);
      return res.status(500).json({ error: 'Failed to update survey', details: error.message });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default adminAPIAuth(handler);
