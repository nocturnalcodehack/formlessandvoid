import React, { useEffect } from 'react';
//= Scripts
import loadBackgroundImages from 'src/common/loadBackgroudImages';

function Overlay() {
  useEffect(() => {
    loadBackgroundImages();
  }, []);

  return (
    <div className="overlay bg-img" data-background="/landing-preview/img/header/data_science.webp"></div>
  )
}

export default Overlay