import { Container } from 'react-bootstrap';
import Link from 'next/link';

async function getSurveys() {
  try {
    const baseUrl = process.env.SITE_ROOT || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/surveys`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return [];
  }
}

export default async function Surveys() {
  const surveys = await getSurveys();

  return (
    <Container className="py-5">
      <h1 className="mb-4">Available Surveys</h1>

      {surveys.length === 0 ? (
        <div className="feature-card text-center">
          <h3>No surveys available at this time</h3>
          <p className="text-secondary mt-3">
            Please check back later for new surveys.
          </p>
        </div>
      ) : (
        <div>
          {surveys.map((survey) => (
            <div key={survey.surveyId} className="feature-card mb-3">
              <h3>{survey.fullName}</h3>
              {survey.description && (
                <p className="text-secondary mt-2">{survey.description}</p>
              )}
              <Link
                href={`/survey/${survey.surveyId}`}
                className="btn btn-primary mt-3"
              >
                Take Survey
              </Link>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

