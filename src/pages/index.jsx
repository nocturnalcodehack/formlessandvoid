import React from 'react';
import PageLayout from 'src/components/PageLayout';

//= Layout
//import Layout from '@/layouts/markathas';


function Home() {
  return (
    <PageLayout>
       <div className="container ontop">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="caption text-center">
              <h1 className="sub-title">
                <span className="icon-img-20 mr-10">
                  <img src="/landing-preview/img/star.svg" alt="" />
                </span>
                <p style={{color:'yellow'}}>UNDER CONSTRUCTION</p>
              </h1>
              <h2>markathas.com</h2>
            <h5>Welcome to markathas.com where we apply data science to interesting questions</h5>
              <p>This site is dedicated to applying the principles and practices of data science, machine learning
              and generative AI to intriguing problems.  Here you may find some of you own assumptions questioned.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

//Home.getLayout = page => <Layout>{page}</Layout>

export default Home;
