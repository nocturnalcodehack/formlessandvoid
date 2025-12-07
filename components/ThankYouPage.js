'use client';

import { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';

export default function ThankYouPage({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Container className="thank-you-container">
        <div className="thank-you-card">
          <div className="thank-you-icon">✓</div>
          <h1 className="mb-3">Survey Submitted!</h1>
          <p className="lead">
            Your responses have been recorded successfully.
          </p>
          <p className="text-secondary mt-4">
            Redirecting you to the home page...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="thank-you-container">
      <div className="thank-you-card">
        <div className="thank-you-icon">🎉</div>
        <h1 className="mb-3">Thank You!</h1>
        <p className="lead mb-4">
          We appreciate you taking the time to complete this survey.
          Your feedback is valuable to us.
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>
              Would you like to provide your email address? (Optional)
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-input"
            />
            <Form.Text className="text-muted">
              Your email will be stored separately and not linked to your survey responses.
            </Form.Text>
          </Form.Group>

          <div className="survey-navigation">
            <Button type="submit" className="btn-primary-survey">
              Submit Survey
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
}

