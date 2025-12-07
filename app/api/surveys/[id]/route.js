import { NextResponse } from 'next/server';
import { Survey, SurveyQuestion } from '@/models';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const survey = await Survey.findByPk(id, {
      include: [{
        model: SurveyQuestion,
        as: 'questions',
        order: [['sequenceNumber', 'ASC']]
      }]
    });

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    if (!survey.isActive) {
      return NextResponse.json({ error: 'Survey is not active' }, { status: 403 });
    }

    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}

