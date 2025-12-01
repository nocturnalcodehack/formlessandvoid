import React from 'react';
import Head from 'next/head';

const MaintenancePage = () => {
  return (
    <>
      <Head>
        <title>Temporarily Unavailable - markathas.com</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            🔧
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            color: '#333',
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            Temporarily Unavailable
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            We're currently performing scheduled maintenance to improve your experience.
            We'll be back online shortly.
          </p>

          <div style={{
            padding: '20px',
            backgroundColor: '#f1f3f4',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <p style={{
              margin: 0,
              color: '#555',
              fontSize: '1rem'
            }}>
              Thank you for your patience while we make improvements to our service.
            </p>
          </div>

          <p style={{
            fontSize: '0.9rem',
            color: '#888',
            margin: 0
          }}>
            If you need immediate assistance, please contact our support team.
          </p>
        </div>
      </div>
    </>
  );
};

export default MaintenancePage;
