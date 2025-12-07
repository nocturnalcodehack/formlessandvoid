import { NextResponse } from 'next/server';
import { Respondent, Survey } from '@/models';

export async function POST(request) {
  try {
    const { respondentId, email } = await request.json();

    const respondent = await Respondent.findByPk(respondentId);

    if (!respondent) {
      return NextResponse.json({ error: 'Respondent not found' }, { status: 404 });
    }

    const submitTime = new Date();
    const totalTimeSeconds = Math.floor((submitTime - respondent.startTime) / 1000);

    await respondent.update({
      status: 'completed',
      submitTime,
      totalTimeSeconds,
      email: email || null
    });

    // Mark survey as having responses
    await Survey.update(
      { hasResponses: true },
      { where: { surveyId: respondent.surveyId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 });
  }
}

