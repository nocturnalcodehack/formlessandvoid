import React, { useEffect } from 'react';
//= Packages
import Head from "next/head";
//= Components
import Loader from 'src/components/Common/Loader';
import Cursor from 'src/components/Common/Cursor';
import ProgressScroll from 'src/components/Common/ProgressScroll';
//= Scripts
import correctStylesheetsOrder from 'src/common/correctStylesheetsOrder';

const PreviewLayout = ({ children }) => {
  useEffect(() => {
    correctStylesheetsOrder({ preview: true });
  }, []);

  return (
    <>
      <Head>
        <link rel="stylesheet" href="/landing-preview/css/preview-style.css" />
      </Head>
      <Loader />
      <Cursor />
      <ProgressScroll />
      {children}
    </>
  );
};

export default PreviewLayout;
