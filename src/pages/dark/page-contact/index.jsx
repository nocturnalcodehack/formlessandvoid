import React, { useEffect } from 'react';
//= Packages

//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Header from 'src/components/Corporate/HeaderNonHome';
import Form from 'src/components/InnerPages/Contact/Form';
import Footer from 'src/components/Corporate/Footer';


function PageContact() {
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
        <Form />
      </main>
      <Footer />
    </>
  )
}

PageContact.getLayout = page => <Layout>{page}</Layout>

export default PageContact;