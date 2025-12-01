import { sequelize, Survey, SurveyRespondent, SurveyResponse } from 'src/models';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import logger from "src/utils/logger";

export default async function handler(req, res) {
  await sequelize.sync();

  logger.info(`survey/submit:INIT: Method: ${req.method}, headers: ${JSON.stringify(req.headers)}, body: ${JSON.stringify(req.body)}`);

  if (req.method === 'POST') {
    try {
      const { surveyId, responses, email, sessionId } = req.body;

      // Find the survey
      const survey = await Survey.findByPk(surveyId);
      if (!survey || !survey.isActive) {
        logger.error(`survey/submit:findBuPk: Survey not found or inactive`);
        return res.status(404).json({ error: 'Survey not found or inactive' });
      }

      // Create or find respondent
      let respondent = await SurveyRespondent.findOne({ where: { sessionId } });
      if (!respondent) {
        logger.info(`survey/submit:create: Creating new respondent`);
        respondent = await SurveyRespondent.create({
          surveyId,
          email,
          sessionId: sessionId || uuidv4(),
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      }

      // Save responses
      logger.info(`survey/submit:saveResponses: respondent ID: ${respondent.id}, responses: ${JSON.stringify(responses)}`);

      for (const response of responses) {
        await SurveyResponse.create({
          surveyId: surveyId, // Add the missing surveyId field
          respondentId: respondent.id,
          questionId: response.questionId,
          responseValue: response.value,
          responseData: response.data || null,
        });
      }

      logger.info(`survey/submit:markComplete for respondent ID ${respondent.id}`);

      // Mark as completed
      await respondent.update({
        isCompleted: true,
        completedAt: new Date(),
      });

      // Send thank you email if email provided
      // if (email && !respondent.thankYouEmailSent) {
      //   try {
      //     await sendThankYouEmail(email, survey);
      //     await respondent.update({ thankYouEmailSent: true });
      //   } catch (emailError) {
      //     console.error('Failed to send thank you email:', emailError);
      //     // Don't fail the whole request if email fails
      //   }
      // }

      res.status(200).json({
        message: 'Survey submitted successfully',
        thankYouMessage: survey.thankYouMessage
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// async function sendThankYouEmail(email, survey) {
//   // Configure your email transporter here
//   const transporter = nodemailer.createTransporter({
//     // Add your email configuration
//     host: process.env.SMTP_HOST || 'localhost',
//     port: process.env.SMTP_PORT || 587,
//     secure: false,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
//
//   await transporter.sendMail({
//     from: process.env.FROM_EMAIL || 'noreply@example.com',
//     to: email,
//     subject: survey.thankYouEmailSubject,
//     text: survey.thankYouEmailBody,
//     html: `<p>${survey.thankYouEmailBody}</p>`,
//   });
// }
