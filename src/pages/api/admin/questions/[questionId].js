import { sequelize, SurveyQuestion } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';


async function handler(req, res) {
  await sequelize.sync();

  const { questionId } = req.query;

  if (req.method === 'GET') {
    try {

      // Check Cookeid before proceeding


      const question = await SurveyQuestion.findByPk(questionId);

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const [updatedRows] = await SurveyQuestion.update(req.body, {
        where: { id: questionId },
        returning: true
      });

      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const updatedQuestion = await SurveyQuestion.findByPk(questionId);
      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedRows = await SurveyQuestion.destroy({
        where: { id: questionId }
      });

      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default adminAPIAuth(handler);
