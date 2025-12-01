import React, { useEffect } from 'react';
//= Packages

//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Header from 'src/components/Corporate/HeaderNonHome';
import Story from 'src/components/InnerPages/About/Story';
import Footer from 'src/components/Corporate/Footer';

function PageAbout() {
  useEffect(() => {
    document.body.classList.add('main-bg');
    return () => document.body.classList.remove('main-bg');
  }, []);

  const headerMetadata = {
    subTitle: "WHO WE ARE ?",
    title: "We're a digital agency based in Valencia.",
    text: "About Us"
  }

  return (
    <>
      <Title />
      <Loader />
      <Navbar mainBg />
      <main>
        <Header data={headerMetadata} />
        <Story />
      </main>
      <Footer />
    </>
  )
}

PageAbout.getLayout = page => <Layout>{page}</Layout>

export default PageAbout;