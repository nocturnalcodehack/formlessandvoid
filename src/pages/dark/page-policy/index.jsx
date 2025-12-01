import React from 'react';
//= Packages

//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Header from 'src/components/Corporate/HeaderNonHome';
import Policy from 'src/components/Corporate/Policy';
import Footer from 'src/components/Corporate/Footer';


function PagePolicy() {

  return (
    <>
      <Title />
      <Loader />
      <Navbar />
      <main>
        <Header />
        <Policy />
      </main>
      <Footer />
    </>
  )
}

PagePolicy.getLayout = page => <Layout>{page}</Layout>

export default PagePolicy;