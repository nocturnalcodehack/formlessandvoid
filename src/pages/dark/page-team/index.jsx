import React, { useEffect } from 'react';
//= Packages

//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Header from 'src/components/Corporate/HeaderNonHome';
import Team from 'src/components/InnerPages/Team/Team';
import Testimonials from 'src/components/InnerPages/Team/Testimonials';
import Footer from 'src/components/Corporate/Footer';


function PageTeam() {
  useEffect(() => {
    document.body.classList.add('main-bg');
    return () => document.body.classList.remove('main-bg');
  }, []);

  return (
    <>
      <Title />

      <Loader />
      <Navbar mainBg />
      <main>
        <Header />
        <Team />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}

PageTeam.getLayout = page => <Layout>{page}</Layout>

export default PageTeam;