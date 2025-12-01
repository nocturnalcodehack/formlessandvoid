import React, { useEffect } from 'react';
//= Scripts
import loadBackgroudImages from 'src/common/loadBackgroudImages';

function Overlay() {
  useEffect(() => {
    loadBackgroudImages();
  }, []);

  return (
    <div className="overlay bg-img" data-background="/landing-preview/img/header/data_science.webp"></div>
  )
}

export default Overlay