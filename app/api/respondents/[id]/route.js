import { NextResponse } from 'next/server';
import { Respondent } from '@/models';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    const respondent = await Respondent.findByPk(id);

    if (!respondent) {
      return NextResponse.json({ error: 'Respondent not found' }, { status: 404 });
    }

    await respondent.update({ status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating respondent:', error);
    return NextResponse.json({ error: 'Failed to update respondent' }, { status: 500 });
  }
}

