import React, { useEffect } from 'react';
import Head from 'next/head';
import Overlay from 'src/components/Corporate/Overlay';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Footer from 'src/components/Corporate/Footer';
import Spacer from "src/components/Common/Spacer";

function SurveyLayout({ children }) {
  useEffect(() => {
    document.body.classList.add('sub-bg');
    return () => document.body.classList.remove('sub-bg');
  }, []);

  return (
    <>
      <Head>
        <link rel="stylesheet" href="/survey-fixes.css" />
      </Head>
      <Title />
      <Navbar />
      <Overlay />
      <main>
        {children}
        <Spacer />
        <Footer />
      </main>
    </>
  )
}

export default SurveyLayout;
