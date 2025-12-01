import React, { useEffect } from 'react';
//= Packages

//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Header from 'src/components/Corporate/HeaderNonHome';
import Services from 'src/components/InnerPages/About/Services';
import Footer from 'src/components/Corporate/Footer';

function PageServices() {
  useEffect(() => {
    document.body.classList.add('main-bg');
    return () => document.body.classList.remove('main-bg');
  }, []);

  const headerMetadata = {
    subTitle: "WHAT CAN WE DO ?",
    title: "We combine our passion for design and code.",
    text: "SERVICES"
  }

  return (
    <>
      <Title />

      <Loader />
      <Navbar mainBg />
      <main>
        <Header data={headerMetadata} subBg={true} />
        <Services />
      </main>
      <Footer />
    </>
  )
}

PageServices.getLayout = page => <Layout>{page}</Layout>

export default PageServices;