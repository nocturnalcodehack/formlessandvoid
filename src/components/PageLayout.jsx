import React, { useEffect } from 'react';
import Overlay from 'src/components/Corporate/Overlay';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Footer from 'src/components/Corporate/Footer';
import Spacer from "src/components/Common/Spacer";

function PageLayout({ children }) {
  useEffect(() => {
    document.body.classList.add('sub-bg');
    return () => document.body.classList.remove('sub-bg');
  }, []);

  return (
    <>
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

export default PageLayout;
