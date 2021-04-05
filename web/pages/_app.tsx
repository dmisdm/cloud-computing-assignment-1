import { useRouter } from "next/router";
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
      <link rel="stylesheet" href="/styles/light.min.css" />
      <Component {...pageProps} />
    </>
  );
}
