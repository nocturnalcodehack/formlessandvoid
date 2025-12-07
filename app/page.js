import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';

export default function Home() {
  return (
    <Container className="py-5">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to Formless and Void</h1>
        <p className="hero-subtitle">
          Your platform for interactive surveys and feedback collection
        </p>
      </div>

      <Row>
        <Col md={6} className="mb-4">
          <div className="feature-card">
            <h3 className="mb-3">📊 Public Surveys</h3>
            <p className="text-secondary">
              Access a variety of public surveys designed to gather insights
              and opinions from diverse participants. Your voice matters!
            </p>
            <Link href="/surveys" className="btn btn-primary mt-3">
              Browse Surveys
            </Link>
          </div>
        </Col>

        <Col md={6} className="mb-4">
          <div className="feature-card">
            <h3 className="mb-3">🔒 Private Surveys</h3>
            <p className="text-secondary">
              Participate in exclusive private surveys by invitation.
              Access specialized research and contribute to targeted studies.
            </p>
          </div>
        </Col>

        <Col md={6} className="mb-4">
          <div className="feature-card">
            <h3 className="mb-3">⚡ Quick & Easy</h3>
            <p className="text-secondary">
              Our intuitive interface makes survey participation smooth and
              enjoyable. Navigate easily through questions at your own pace.
            </p>
          </div>
        </Col>

        <Col md={6} className="mb-4">
          <div className="feature-card">
            <h3 className="mb-3">🎯 Make an Impact</h3>
            <p className="text-secondary">
              Your responses help organizations make better decisions and
              understand their communities. Every response counts!
            </p>
          </div>
        </Col>
      </Row>

      <div className="text-center mt-5">
        <h2 className="mb-4">Ready to get started?</h2>
        <Link href="/surveys" className="btn btn-primary btn-lg">
          View Available Surveys
        </Link>
      </div>
    </Container>
  );
}

