'use client';

import { useParams } from 'next/navigation';
import SurveyTaker from '@/components/SurveyTaker';

export default function SurveyPage() {
  const params = useParams();
  const surveyId = params.id;

  return <SurveyTaker surveyId={surveyId} />;
}

