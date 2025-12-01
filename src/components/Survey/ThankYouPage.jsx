import React from 'react';
import { useRouter } from 'next/router';

const ThankYouPage = ({ message }) => {
  const router = useRouter();

  return (
    <div className="thank-you-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="thank-you-card card text-center">
              <div className="card-body p-5">
                <div className="thank-you-icon mb-4">
                  <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="thank-you-title mb-3">Thank You!</h2>
                <p className="thank-you-message lead" style={{ color: 'black' }}>
                  {message || 'Thank you for completing our survey. Your responses are valuable to us.'}
                </p>
                <div className="mt-4">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => router.push('/')}
                  >
                    Return Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
