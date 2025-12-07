import { Container } from 'react-bootstrap';

export default function Contact() {
  return (
    <Container className="contact-container">
      <div className="contact-card">
        <h1 className="mb-4">Get in Touch</h1>
        <p className="lead mb-4">
          We'd love to hear from you! Whether you have questions about our surveys,
          need assistance, or want to provide feedback, we're here to help.
        </p>

        <div className="mb-4">
          <h3 className="h5 mb-3">📧 Email Us</h3>
          <p>
            For all inquiries, please reach out to us at:
          </p>
          <a
            href="mailto:later@company.com"
            className="btn btn-primary btn-lg"
          >
            later@company.com
          </a>
        </div>

        <div className="mt-5 pt-4 border-top">
          <p className="text-secondary mb-0">
            We aim to respond to all inquiries within 24-48 hours.
          </p>
        </div>
      </div>
    </Container>
  );
}

