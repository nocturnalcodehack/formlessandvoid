import { NextResponse } from 'next/server';
import { Survey, SurveyQuestion } from '@/models';
import { Op } from 'sequelize';

export async function GET() {
  try {
    const now = new Date();

    const surveys = await Survey.findAll({
      where: {
        isActive: true,
        isPublic: true,
        [Op.or]: [
          { startDate: null },
          { startDate: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: now } }
        ]
      },
      attributes: ['surveyId', 'shortName', 'fullName', 'description'],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}

