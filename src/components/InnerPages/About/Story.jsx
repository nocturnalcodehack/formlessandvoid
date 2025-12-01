import React, { useEffect } from 'react';
//= Scripts
import loadBackgroudImages from 'src/common/loadBackgroudImages';

function Story() {
  useEffect(() => {
    loadBackgroudImages();
  }, []);

  return (
    <section className="pg-about section-padding sub-bg">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="bg-img radius-10 md-mb50" data-background="/dark/assets/imgs/about/earth_burst.webp"></div>
          </div>
          <div className="col-lg-8">
            <div className="bg-img radius-10" data-background="/dark/assets/imgs/about/data_science.webp"></div>
          </div>
          <div className="col-lg-4">
            <div className="sec-head mt-80">
              <h6 className="sub-title">Mark's Story.</h6>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="cont mt-80">
              <h4>Mark started his career in information technology decades ago and has been a software
              engineer, database platforms manager, professional consultant, vice president of information
              technology and agile coach.  With a return to data, Mark is passionate about applying the data
              sciences to experimental problems and data-based decision making.</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Story