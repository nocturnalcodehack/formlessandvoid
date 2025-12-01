import React, { useEffect } from 'react';
//= Packages
import Head from 'next/head';
//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Navbar from 'src/components/Common/MainNavbar';
import Header from 'src/components/InnerPages/Blog/Header';
import ImageOutFrame from 'src/components/InnerPages/Blog/ImageOutFrame';
import Footer from 'src/components/Corporate/Footer';


function BlogImageOutFrame() {
  useEffect(() => {
    document.body.classList.add('main-bg');
    return () => document.body.classList.remove('main-bg');
  }, []);

  const metadata = {
    subTitle: "OUR BLOG",
    title: "Latest News."
  }

  return (
    <>
      <Head>
        <title>markathas.com - Image Out Frame</title>
      </Head>

      <Loader />
      <Navbar mainBg />
      <main className="main-bg">
        <Header data={metadata} />
        <ImageOutFrame />
      </main>
      <Footer />
    </>
  )
}

BlogImageOutFrame.getLayout = page => <Layout>{page}</Layout>

export default BlogImageOutFrame;