import type { AppProps } from "next/app";
import { Suspense } from "react";
import { MainNav } from "@/components/main-nav";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Suspense>
        <MainNav />
      </Suspense>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
