import { Container } from 'react-bootstrap';
import Link from 'next/link';
import { Survey } from '@/models';
import { Op } from 'sequelize';

async function getSurveys() {
  try {
    const now = new Date();

    const surveys = await Survey.findAll({
      where: {
        isActive: true,
        isPublic: true,
        [Op.and]: [
          {
            [Op.or]: [
              { startDate: null },
              { startDate: { [Op.lte]: now } }
            ]
          },
          {
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: now } }
            ]
          }
        ]
      },
      attributes: ['surveyId', 'shortName', 'fullName', 'description'],
      order: [['createdAt', 'DESC']]
    });

    // Convert Sequelize instances to plain objects for Next.js serialization
    return surveys.map(survey => survey.toJSON());
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

