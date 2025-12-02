import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="sub-footer pt-40 pb-40 ontop sub-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="logo">
                <p className="fz-13">© formlessandvoid </p>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="copyright d-flex">
                <div className="ml-auto">
                  <p className="fz-13">© {new Date().getFullYear()} formlessandvoid.com </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer