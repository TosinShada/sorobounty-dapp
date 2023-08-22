import type { AppProps } from "next/app";
import { Suspense } from "react";
import { MainNav } from "@/components/main-nav";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Suspense>
        <MainNav />
      </Suspense>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default MyApp;
