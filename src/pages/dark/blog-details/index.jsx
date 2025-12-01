import React, { useEffect } from 'react';
//= Packages
import Head from 'next/head';
//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Navbar from 'src/components/Common/MainNavbar';
import Details from 'src/components/InnerPages/Blog/Details';
import Footer from 'src/components/Corporate/Footer';


function BlogDetails() {
  useEffect(() => {
    document.body.classList.add('main-bg');
    return () => document.body.classList.remove('main-bg');
  }, []);

  return (
    <>
      <Head>
        <title>markathas.com - Blog Details</title>
      </Head>

      <Loader />
      <Navbar mainBg />
      <main>
        <Details />
      </main>
      <Footer />
    </>
  )
}

BlogDetails.getLayout = page => <Layout>{page}</Layout>

export default BlogDetails;