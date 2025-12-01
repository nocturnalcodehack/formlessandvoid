import React, { useState } from 'react';
import Link from "next/link";



function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState(null);
  const url = '/api/qualify'
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    // Get form inputs
    const form_zip = document.getElementById('form_zip').value;
    const form_amount = document.getElementById('form_amount').value;
    const form_propval = document.getElementById('form_propval').value;
    const form_income = document.getElementById('form_income').value;

    const inputData = { form_zip, form_amount, form_propval, form_income };

    try {
      const res = await fetch(url, {
        method: 'POST', // Change method to POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData) // Pass form inputs in body
      });

      const result = await res.json();
      setResponse(result);
      console.log(result)
    } catch (error) {
      console.error("There was an error with the API request:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="contact-crev section-padding">
      <div className="caption text-center">
        <h5 className="sub-title"><Link style={{color:"lightskyblue"}} href="/dark/page-policy">Read about</Link> what we do with this data</h5>
        <br />
      </div>
      <div className="container">
          <div className="col-lg-6 offset-lg-1 valign">
            <div className="full-width">
              <form id="contact-form" onSubmit={handleSubmit}>
                <div className="messages"></div>
                <div className="controls row">
                  <div className="col-lg-6">
                    <div className="form-group mb-30">
                      <label htmlFor="form_zip">Zip Code:</label>
                      <input id="form_zip" type="text" name="Zip Code" placeholder="ZipCode" required="required" />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group mb-30">
                      <label htmlFor="form_amount">Loan Amount:</label>
                      <input id="form_amount" type="dollar" name="Loan Amount" placeholder="Loan Amount" required="required" />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group mb-30">
                      <label htmlFor="form_propval">Property Value:</label>
                      <input id="form_propval" type="dollar" name="Property Value" placeholder="Property Value" required="required" />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group mb-30">
                      <label htmlFor="form_income">Income:</label>
                      <input id="form_income" type="dollar" name="Household Income" placeholder="Household Income" required="required" />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mt-30">
                      <button type="submit" className="butn butn-md butn-bord radius-30" disabled={isSubmitting}>
                        <span className="text">Get Your Qualification</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div>
              {response && (
                <div>
                  <h3>API Response:</h3>
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
    </section>
  )
}
export default Form