import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="formlessandvoid.com" />
        <meta name="author" content="formlessandvoid.com" />
        {/* ------ Favicon ------ */}
        <link rel="shortcut icon" href="/dark/assets/imgs/favicon.ico" />
       {/* ------ bootstrap icons cdn ------ */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" />
        {/* ------ Survey CSS Fixes ------ */}
        <link rel="stylesheet" href="/survey-fixes.css" />
        {/* ------ Plugins ------ */}
        <link rel="stylesheet" href="/dark/assets/css/plugins.css" />
        {/* ------ Core Style Css ------ */}
        <link rel="stylesheet" href="/dark/assets/css/style.css" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
