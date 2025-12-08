'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Navbar as BSNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';

export default function Navbar() {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      console.log('Fetching surveys from /api/surveys...');
      const response = await fetch('/api/surveys');
      console.log('Response status:', response.status, 'OK:', response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('Surveys fetched:', data);
        setSurveys(data);
      } else {
        console.error('Failed to fetch surveys, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  return (
    <BSNavbar bg="white" expand="lg" fixed="top" className="shadow-sm">
      <Container>
        <BSNavbar.Brand as={Link} href="/">
          <strong>Formless and Void</strong>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} href="/">
              Home
            </Nav.Link>

            {surveys.length > 0 ? (
              <NavDropdown title="Surveys" id="surveys-dropdown">
                {surveys.map((survey) => (
                  <NavDropdown.Item
                    key={survey.surveyId}
                    as={Link}
                    href={`/survey/${survey.surveyId}`}
                  >
                    {survey.shortName}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} href="/surveys">
                Surveys
              </Nav.Link>
            )}

            <Nav.Link as={Link} href="/contact">
              Contact
            </Nav.Link>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

