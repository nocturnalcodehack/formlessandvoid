import { sequelize, Survey } from 'src/models';
import { adminAPIAuth } from 'src/utils/AdminAPIAuth';
import getClientIP from 'src/utils/getClientIP';
import logger from "src/utils/logger";

async function handler(req, res) {
  await sequelize.sync();

  const ip = getClientIP(req);
  const { id } = req.query;

  logger.debug(`surveys toggle-active API:INIT: IP: ${ip}, Method: ${req.method}, Survey ID: ${id}`);

  if (req.method === 'PATCH') {
    try {
      // Validate survey ID
      if (!id) {
        logger.error(`surveys toggle-active API: PATCH: Missing survey ID`);
        return res.status(400).json({ error: 'Survey ID is required' });
      }

      // Find the existing survey
      const existingSurvey = await Survey.findByPk(id);
      if (!existingSurvey) {
        logger.error(`surveys toggle-active API: PATCH: Survey not found with ID: ${id}`);
        return res.status(404).json({ error: 'Survey not found' });
      }

      // Toggle the isActive status
      const newActiveStatus = !existingSurvey.isActive;

      // Update only the isActive field
      await existingSurvey.update({
        isActive: newActiveStatus
      });

      logger.info(`surveys toggle-active API: PATCH: Survey ${id} isActive toggled to: ${newActiveStatus}`);

      // Return the updated survey with minimal data (just what's needed)
      const updatedSurvey = await Survey.findByPk(id, {
        attributes: ['id', 'title', 'description', 'startDate', 'endDate', 'isActive', 'createdAt', 'updatedAt']
      });

      return res.status(200).json({
        id: updatedSurvey.id,
        isActive: updatedSurvey.isActive,
        message: `Survey ${newActiveStatus ? 'activated' : 'deactivated'} successfully`
      });

    } catch (error) {
      logger.error(`surveys toggle-active API: PATCH: Error toggling survey status: ${error.message}`);
      return res.status(500).json({ error: 'Failed to toggle survey status', details: error.message });
    }

  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export default adminAPIAuth(handler);
