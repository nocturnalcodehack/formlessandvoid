import { NextResponse } from 'next/server';
import { Response } from '@/models';

export async function POST(request) {
  try {
    const { respondentId, surveyQuestionId, responseValue, timeSpentSeconds, visitCount } = await request.json();

    // Check if response already exists
    const existingResponse = await Response.findOne({
      where: { respondentId, surveyQuestionId }
    });

    let response;
    if (existingResponse) {
      // Update existing response
      await existingResponse.update({
        responseValue,
        timeSpentSeconds,
        visitCount
      });
      response = existingResponse;
    } else {
      // Create new response
      response = await Response.create({
        respondentId,
        surveyQuestionId,
        responseValue,
        timeSpentSeconds,
        visitCount
      });
    }

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}

