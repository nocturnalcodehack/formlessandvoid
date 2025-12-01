import React, { useEffect } from 'react';
//= Packages

//= Layout
import Layout from 'src/layouts/markathas';
//= Components
import Loader from 'src/components/Common/Loader';
import Title from 'src/components/Corporate/Title';
import Navbar from 'src/components/Corporate/Navbar';
import Header from 'src/components/InnerPages/Blog/Header';
import Classic from 'src/components/InnerPages/Blog/Classic';
import Footer from 'src/components/Corporate/Footer';


function BlogClassic() {
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
      <Title>
        <title>markathas.com - Blog Classic</title>
      </Title>

      <Loader />
      <Navbar mainBg />
      <main className="main-bg">
        <Header data={metadata} />
        <Classic />
      </main>
      <Footer />
    </>
  )
}

BlogClassic.getLayout = page => <Layout>{page}</Layout>

export default BlogClassic;