import React, { useEffect } from 'react';
//= Packages
import Head from 'next/head';
//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Navbar from 'src/components/Common/MainNavbar';
import Header from 'src/components/InnerPages/Blog/Header';
import List from 'src/components/InnerPages/Blog/List';
import Footer from 'src/components/Corporate/Footer';

function BlogList() {
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
        <title>markathas.com - Blog List</title>
      </Head>

      <Loader />
      <Navbar mainBg />
      <main className="main-bg">
        <Header data={metadata} />
        <List />
      </main>
      <Footer />
    </>
  )
}

BlogList.getLayout = page => <Layout>{page}</Layout>

export default BlogList;