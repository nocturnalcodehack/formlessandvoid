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
            <h2>Welcome to formlessandvoid</h2> <br/>
              <p>Here we apply interactive survey methods, data science, and anaysis to take your formless
              hypothesis about persons, places or things and replace that void with with actionable
                insight.</p> <br/> <br/>
              <p>We host both public surveys--linked at the menu item above, and private surveys where
              participants are invited with unique link.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

//Home.getLayout = page => <Layout>{page}</Layout>

export default Home;
