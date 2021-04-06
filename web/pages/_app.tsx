import Head from "next/head";
import React from "react";
import "../styles.css";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp<Props>({
  Component,
  pageProps,
}: {
  Component: React.ComponentType<Props>;
  pageProps: Props;
}) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/styles/light.min.css" />
        <title>The Turing Network</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
