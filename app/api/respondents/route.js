import { NextResponse } from 'next/server';
import { Respondent } from '@/models';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const { surveyId } = await request.json();

    // Get IP address from headers
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

    const respondent = await Respondent.create({
      surveyId,
      ipAddress,
      status: 'started',
      startTime: new Date()
    });

    return NextResponse.json({ respondentId: respondent.respondentId });
  } catch (error) {
    console.error('Error creating respondent:', error);
    return NextResponse.json({ error: 'Failed to create respondent' }, { status: 500 });
  }
}

