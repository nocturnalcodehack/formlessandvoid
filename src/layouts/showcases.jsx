import React, { useEffect } from 'react';
//= Packages
import Head from "next/head";
//= Scripts
import correctStylesheetsOrder from 'src/common/correctStylesheetsOrder';
//= Components
import Loader from 'src/components/Common/Loader';
import Cursor from 'src/components/Common/Cursor';
import ProgressScroll from 'src/components/Common/ProgressScroll';

const DefaultLayout = ({ children, lightMode }) => {
  useEffect(() => {
    correctStylesheetsOrder({ lightMode });
  }, [lightMode]);

  return (
    <>
      <Head>
        {
          lightMode ?
            <>
              <link rel="stylesheet" href="/light/assets/css/plugins.css" />
              <link rel="stylesheet" href="/light/assets/css/style.css" />
              <link rel="stylesheet" href="/light/showcase/assets/css/showcases.css" />
            </>
            :
            <>
              <link rel="stylesheet" href="/dark/assets/css/base.css" />
              <link rel="stylesheet" href="/dark/showcase/assets/css/showcases.css" />
            </>
        }
      </Head>

      <Loader />
      <Cursor />
      <ProgressScroll />
      {children}
    </>
  );
};

export default DefaultLayout;
